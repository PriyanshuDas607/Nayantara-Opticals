import { PrescriptionType, UploadStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { StorageService } from "./storage.service.js";
import { AuditService } from "./audit.service.js";

export class PrescriptionService {
  /**
   * Generates upload URL for prescription file
   */
  static async getUploadUrl(fileName: string, mimeType: string) {
    return StorageService.getPresignedUploadUrl(fileName, mimeType, "prescriptions");
  }

  /**
   * Directly uploads prescription buffer to Supabase Storage and records metadata
   */
  static async uploadPrescriptionFile(data: {
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
    userId: string;
    appointmentId?: string;
    orderId?: string;
    notes?: string;
  }) {
    // 1. Upload to Supabase Storage (enforcing <= 10MB and PDF/JPEG/PNG formats)
    const storageResult = await StorageService.uploadPrescriptionBuffer(
      data.file.buffer,
      data.file.originalname,
      data.file.mimetype,
      "prescriptions"
    );

    // 2. Atomically store records in Supabase PostgreSQL
    const prescription = await prisma.$transaction(async (tx) => {
      const fileUpload = await tx.fileUpload.create({
        data: {
          objectKey: storageResult.objectKey,
          originalFileName: data.file.originalname,
          mimeType: data.file.mimetype,
          sizeBytes: data.file.size,
          uploadStatus: UploadStatus.AVAILABLE,
        },
      });

      const rx = await tx.prescription.create({
        data: {
          userId: data.userId,
          appointmentId: data.appointmentId,
          orderId: data.orderId,
          type: PrescriptionType.FILE,
          fileUploadId: fileUpload.id,
          notes: data.notes,
        },
        include: {
          fileUpload: true,
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              customerProfile: true,
            },
          },
        },
      });

      return rx;
    });

    return {
      ...prescription,
      downloadUrl: storageResult.downloadUrl,
      storageType: storageResult.storageType,
    };
  }

  /**
   * Completes a pre-uploaded file and records metadata in database
   */
  static async completeFileUpload(data: {
    userId: string;
    objectKey: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    appointmentId?: string;
    orderId?: string;
    notes?: string;
  }) {
    StorageService.validatePrescriptionFile(data.mimeType, data.sizeBytes);

    const prescription = await prisma.$transaction(async (tx) => {
      const fileUpload = await tx.fileUpload.create({
        data: {
          objectKey: data.objectKey,
          originalFileName: data.originalFileName,
          mimeType: data.mimeType,
          sizeBytes: data.sizeBytes,
          uploadStatus: UploadStatus.AVAILABLE,
        },
      });

      const rx = await tx.prescription.create({
        data: {
          userId: data.userId,
          appointmentId: data.appointmentId,
          orderId: data.orderId,
          type: PrescriptionType.FILE,
          fileUploadId: fileUpload.id,
          notes: data.notes,
        },
        include: {
          fileUpload: true,
        },
      });

      return rx;
    });

    return prescription;
  }

  /**
   * Creates a manual numeric prescription entry
   */
  static async createManualPrescription(data: {
    userId: string;
    appointmentId?: string;
    orderId?: string;
    sphereOD?: string;
    cylinderOD?: string;
    axisOD?: string;
    sphereOS?: string;
    cylinderOS?: string;
    axisOS?: string;
    addition?: string;
    pd?: string;
    notes?: string;
  }) {
    return prisma.prescription.create({
      data: {
        userId: data.userId,
        appointmentId: data.appointmentId,
        orderId: data.orderId,
        type: PrescriptionType.MANUAL,
        sphereOD: data.sphereOD,
        cylinderOD: data.cylinderOD,
        axisOD: data.axisOD,
        sphereOS: data.sphereOS,
        cylinderOS: data.cylinderOS,
        axisOS: data.axisOS,
        addition: data.addition,
        pd: data.pd,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            customerProfile: true,
          },
        },
      },
    });
  }

  /**
   * Customer gets their own prescriptions with download URLs
   */
  static async getCustomerPrescriptions(userId: string) {
    const list = await prisma.prescription.findMany({
      where: { userId, deletedAt: null },
      include: { fileUpload: true, appointment: true, order: true },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      list.map(async (rx) => {
        let downloadUrl = null;
        if (rx.fileUpload?.objectKey) {
          try {
            downloadUrl = await StorageService.getPresignedDownloadUrl(rx.fileUpload.objectKey);
          } catch {
            downloadUrl = null;
          }
        }
        return {
          ...rx,
          downloadUrl,
        };
      })
    );
  }

  /**
   * Generates an authorized, audited temporary download URL for a prescription file
   */
  static async getAuthorizedDownloadUrl(
    prescriptionId: string,
    requestingUserId: string,
    requestingUserRole: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ downloadUrl: string; originalFileName: string }> {
    const rx = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { fileUpload: true },
    });

    if (!rx || !rx.fileUpload || rx.deletedAt) {
      throw new Error("Prescription file not found or has been deleted.");
    }

    // RBAC and IDOR Authorization Check (CUSTOMER only allowed to access their own)
    if (requestingUserRole === "CUSTOMER" && rx.userId !== requestingUserId) {
      throw new Error("Unauthorized to access this prescription.");
    }

    // Generate signed download URL from Supabase Storage
    const downloadUrl = await StorageService.getPresignedDownloadUrl(rx.fileUpload.objectKey);

    // Record mandatory audit log
    await AuditService.log({
      userId: requestingUserId,
      action: "VIEW_PRESCRIPTION_FILE",
      resource: `Prescription:${prescriptionId}`,
      ipAddress,
      userAgent,
      details: {
        fileUploadId: rx.fileUploadId,
        fileName: rx.fileUpload.originalFileName,
      },
    });

    return {
      downloadUrl,
      originalFileName: rx.fileUpload.originalFileName,
    };
  }

  /**
   * Admin / Owner prescription listing with customer details and direct download URLs
   */
  static async getAllPrescriptions(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.prescription.count({ where: { deletedAt: null } }),
      prisma.prescription.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              customerProfile: true,
            },
          },
          fileUpload: true,
          appointment: true,
          order: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const enrichedItems = await Promise.all(
      items.map(async (rx) => {
        let downloadUrl = null;
        if (rx.fileUpload?.objectKey) {
          try {
            downloadUrl = await StorageService.getPresignedDownloadUrl(rx.fileUpload.objectKey);
          } catch {
            downloadUrl = null;
          }
        }
        return {
          ...rx,
          downloadUrl,
        };
      })
    );

    return {
      items: enrichedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
