import { TryOnStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { StorageService } from "./storage.service.js";

/**
 * Virtual Try-On Module
 *
 * NOTE: Virtual Try-On AI/model implementation should be developed separately
 * with a specialized model/service. Consider switching to Claude or an appropriate vision/AI model
 * for this computer-vision module.
 */
export class VirtualTryOnService {
  /**
   * Initializes a virtual try-on session
   */
  static async createSession(productId: string, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.virtualTryOnEnabled) {
      throw new Error("Virtual Try-On is not currently enabled for this frame.");
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min session

    const session = await prisma.virtualTryOnSession.create({
      data: {
        productId,
        userId,
        status: TryOnStatus.CREATED,
        provider: "claude-vision-pipeline",
        expiresAt,
      },
    });

    // Generate secure upload URL for face photo
    const { uploadUrl, objectKey } = await StorageService.getPresignedUploadUrl(
      `face-${session.id}.jpg`,
      "image/jpeg",
      "try-on-faces"
    );

    await prisma.virtualTryOnSession.update({
      where: { id: session.id },
      data: { faceImageObjectKey: objectKey },
    });

    return {
      sessionId: session.id,
      uploadUrl,
      expiresAt: session.expiresAt.toISOString(),
      instructions: "Upload your frontal selfie, then call /process to generate the frame try-on preview.",
    };
  }

  /**
   * Gets status of try-on session
   */
  static async getSessionStatus(sessionId: string) {
    const session = await prisma.virtualTryOnSession.findUnique({
      where: { id: sessionId },
      include: { product: true },
    });

    if (!session) {
      throw new Error("Try-on session not found or expired.");
    }

    let downloadUrl: string | undefined;
    if (session.renderedImageObjectKey && session.status === TryOnStatus.COMPLETED) {
      downloadUrl = await StorageService.getPresignedDownloadUrl(session.renderedImageObjectKey);
    }

    return {
      sessionId: session.id,
      status: session.status,
      renderedImageUrl: downloadUrl,
      product: {
        id: session.product.id,
        name: session.product.name,
      },
    };
  }
}
