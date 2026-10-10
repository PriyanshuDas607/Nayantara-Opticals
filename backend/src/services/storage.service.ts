import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import { CryptoUtil } from "../utils/crypto.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_FALLBACK_DIR = path.resolve(__dirname, "../../uploads/prescriptions");

// Strictly allowed formats: JPEG, PNG, PDF
export const ALLOWED_PRESCRIPTION_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

export const MAX_PRESCRIPTION_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export interface StorageUploadResult {
  objectKey: string;
  storageType: "supabase" | "local";
  downloadUrl?: string;
}

export class StorageService {
  private static supabaseClient: SupabaseClient | null = null;
  private static bucketInitialized = false;

  private static getSupabase(): SupabaseClient | null {
    const url = config.supabase.url;
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;

    if (!key || !url) {
      return null;
    }

    if (!this.supabaseClient) {
      this.supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    return this.supabaseClient;
  }

  /**
   * Ensures the private storage bucket exists in Supabase
   */
  private static async ensureBucketExists(client: SupabaseClient): Promise<void> {
    if (this.bucketInitialized) return;
    try {
      const { data: buckets } = await client.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === config.supabase.bucketName);
      if (!exists) {
        await client.storage.createBucket(config.supabase.bucketName, {
          public: false,
          fileSizeLimit: "10MB",
          allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        });
      }
      this.bucketInitialized = true;
    } catch {
      // Bucket may already exist or user may have restricted bucket listing permissions
      this.bucketInitialized = true;
    }
  }

  /**
   * Validates prescription file size and MIME type
   */
  static validatePrescriptionFile(mimeType: string, sizeBytes: number): void {
    const normalizedMime = (mimeType || "").toLowerCase().trim();
    if (!ALLOWED_PRESCRIPTION_MIME_TYPES.has(normalizedMime)) {
      throw new Error(
        `Invalid file type (${mimeType}). Only JPEG (.jpg, .jpeg), PNG (.png), and PDF (.pdf) files are allowed.`
      );
    }

    if (sizeBytes > MAX_PRESCRIPTION_FILE_SIZE_BYTES) {
      throw new Error(
        `File size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB limit. Please upload a file smaller than 10 MB.`
      );
    }
  }

  /**
   * Generates upload URL / objectKey (Supabase signed upload or endpoint)
   */
  static async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    prefix = "prescriptions"
  ): Promise<{ uploadUrl: string; objectKey: string; expiresAt: string }> {
    const ext = fileName.split(".").pop() || "bin";
    const uniqueToken = CryptoUtil.generateSecureToken(12);
    const objectKey = `${prefix}/${Date.now()}_${uniqueToken}.${ext}`;

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await this.ensureBucketExists(supabase);
        const { data, error } = await supabase.storage
          .from(config.supabase.bucketName)
          .createSignedUploadUrl(objectKey);

        if (!error && data?.signedUrl) {
          return {
            uploadUrl: data.signedUrl,
            objectKey,
            expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }

    return {
      uploadUrl: `/api/v1/prescriptions/upload`,
      objectKey,
      expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
    };
  }

  /**
   * Uploads prescription buffer to Supabase Storage (with safe local fallback if credentials pending)
   */
  static async uploadPrescriptionBuffer(
    buffer: Buffer,
    originalFileName: string,
    mimeType: string,
    prefix = "prescriptions"
  ): Promise<StorageUploadResult> {
    this.validatePrescriptionFile(mimeType, buffer.length);

    const fileExt = (originalFileName.split(".").pop() || "bin").toLowerCase();
    const uniqueToken = CryptoUtil.generateSecureToken(12);
    const objectKey = `${prefix}/${Date.now()}_${uniqueToken}.${fileExt}`;

    const supabase = this.getSupabase();

    if (supabase) {
      try {
        await this.ensureBucketExists(supabase);

        const { error: uploadError } = await supabase.storage
          .from(config.supabase.bucketName)
          .upload(objectKey, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const signedUrl = await this.getPresignedDownloadUrl(objectKey);

        return {
          objectKey,
          storageType: "supabase",
          downloadUrl: signedUrl,
        };
      } catch (err) {
        console.warn(
          "[StorageService] Supabase upload failed, falling back to local vault storage:",
          (err as Error).message
        );
      }
    }

    // Local Disk Fallback (ensures smooth dev experience before Supabase API keys are set)
    if (!fs.existsSync(UPLOAD_FALLBACK_DIR)) {
      fs.mkdirSync(UPLOAD_FALLBACK_DIR, { recursive: true });
    }

    const localFilePath = path.join(UPLOAD_FALLBACK_DIR, path.basename(objectKey));
    fs.writeFileSync(localFilePath, buffer);

    return {
      objectKey,
      storageType: "local",
      downloadUrl: `/api/v1/prescriptions/raw/${encodeURIComponent(objectKey)}`,
    };
  }

  /**
   * Generates a secure short-lived/session signed download URL for viewing
   */
  static async getPresignedDownloadUrl(objectKey: string): Promise<string> {
    const supabase = this.getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(config.supabase.bucketName)
          .createSignedUrl(objectKey, 60 * 60 * 24); // 24 hours access

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.warn("[StorageService] Failed to create Supabase signed URL:", (err as Error).message);
      }
    }

    // Local download endpoint
    return `/api/v1/prescriptions/raw/${encodeURIComponent(objectKey)}`;
  }

  /**
   * Gets local file buffer if stored locally
   */
  static getLocalFile(objectKey: string): { buffer: Buffer; fileName: string } | null {
    const localFilePath = path.join(UPLOAD_FALLBACK_DIR, path.basename(objectKey));
    if (fs.existsSync(localFilePath)) {
      return {
        buffer: fs.readFileSync(localFilePath),
        fileName: path.basename(objectKey),
      };
    }
    return null;
  }

  /**
   * Deletes a file from Supabase Storage or local vault
   */
  static async deleteFile(objectKey: string): Promise<void> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.storage.from(config.supabase.bucketName).remove([objectKey]);
      } catch {
        // Ignore deletion errors
      }
    }

    const localFilePath = path.join(UPLOAD_FALLBACK_DIR, path.basename(objectKey));
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch {
        // Ignore
      }
    }
  }
}
