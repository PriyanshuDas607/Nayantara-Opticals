import { PrescriptionType, UploadStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { StorageService } from "./storage.service.js";
import { AuditService } from "./audit.service.js";

export class PrescriptionService {
  /**
   * Generates presigned upload URL for prescription file
   */
  static async getUploadUrl(fileName: string, mimeType: string) {
    return StorageService.getPresignedUploadUrl(fileName, mimeType, "prescriptions");
  }

  /**
   * Completes a file upload and records metadata in database
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
    });
  }

  /**
   * Customer gets their own prescriptions
   */
  static async getCustomerPrescriptions(userId: string) {
    return prisma.prescription.findMany({
      where: { userId, deletedAt: null },
      include: { fileUpload: true, appointment: true, order: true },
      orderBy: { createdAt: "desc" },
    });
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

    // RBAC and IDOR Authorization Check
    if (requestingUserRole === "CUSTOMER" && rx.userId !== requestingUserId) {
      throw new Error("Unauthorized to access this prescription.");
    }

    // Generate signed download URL
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
   * Admin / Owner prescription listing with audit
   */
  static async getAllPrescriptions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.prescription.count({ where: { deletedAt: null } }),
      prisma.prescription.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, phone: true, customerProfile: true } },
          fileUpload: true,
          appointment: true,
          order: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
