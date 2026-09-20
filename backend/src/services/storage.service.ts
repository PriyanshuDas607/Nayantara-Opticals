import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/index.js";
import { CryptoUtil } from "../utils/crypto.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class StorageService {
  private static s3Client: S3Client | null = null;

  private static getClient(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: config.s3.region,
        credentials: {
          accessKeyId: config.s3.accessKeyId || "placeholder",
          secretAccessKey: config.s3.secretAccessKey || "placeholder",
        },
        endpoint: config.s3.endpoint,
        forcePathStyle: !!config.s3.endpoint,
      });
    }
    return this.s3Client;
  }

  /**
   * Generates a short-lived presigned upload URL for direct client-to-S3 uploads
   */
  static async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    prefix = "prescriptions"
  ): Promise<{ uploadUrl: string; objectKey: string; expiresAt: string }> {
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(`Unsupported file type: ${mimeType}. Allowed types: PDF, JPEG, PNG, WEBP`);
    }

    const fileExt = fileName.split(".").pop() || "bin";
    const uniqueId = CryptoUtil.generateSecureToken(16);
    const objectKey = `${prefix}/${uniqueId}.${fileExt}`;

    const client = this.getClient();
    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: objectKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: config.s3.signedUrlExpirySeconds,
    });

    const expiresAt = new Date(
      Date.now() + config.s3.signedUrlExpirySeconds * 1000
    ).toISOString();

    return {
      uploadUrl,
      objectKey,
      expiresAt,
    };
  }

  /**
   * Generates a short-lived signed download URL for authorized viewing/downloading
   */
  static async getPresignedDownloadUrl(objectKey: string): Promise<string> {
    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: objectKey,
    });

    return getSignedUrl(client, command, {
      expiresIn: config.s3.signedUrlExpirySeconds,
    });
  }

  /**
   * Deletes a file from object storage
   */
  static async deleteFile(objectKey: string): Promise<void> {
    const client = this.getClient();
    const command = new DeleteObjectCommand({
      Bucket: config.s3.bucketName,
      Key: objectKey,
    });

    await client.send(command);
  }
}
