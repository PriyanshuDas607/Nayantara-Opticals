import { toast } from "sonner";

const isProd =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const rawApiUrl =
  (import.meta.env as Record<string, string | undefined>)["VITE_API_URL"] ||
  (isProd
    ? "https://nayantara-backend.onrender.com/api/v1"
    : "http://localhost:5000/api/v1");

export const API_BASE_URL = rawApiUrl.trim().replace(/\/$/, "");

const SUPABASE_STORAGE_PUBLIC_BASE =
  "https://zxiatmlrdfzfettbyqmj.supabase.co/storage/v1/object/public/prescriptions";

export interface PrescriptionFileRef {
  objectKey?: string | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  fileDataBase64?: string | null;
}

/**
 * Resolves a prescription file or download URL so that relative backend URLs,
 * Supabase storage CDN paths, and embedded base64 are seamlessly routed,
 * preventing 404 errors when viewing or downloading prescriptions.
 */
export function resolvePrescriptionUrl(
  url?: string | null,
  prescriptionId?: string,
  fileUpload?: PrescriptionFileRef | null
): string {
  // 1. If base64 data URI is available, return data URL directly
  if (fileUpload?.fileDataBase64) {
    const mime = fileUpload.mimeType || "application/octet-stream";
    return `data:${mime};base64,${fileUpload.fileDataBase64}`;
  }

  // 2. If objectKey is available in metadata, resolve to direct Supabase storage CDN
  const objectKey = fileUpload?.objectKey;
  if (objectKey) {
    const cleanKey = objectKey.replace(/^\/+/, "");
    return `${SUPABASE_STORAGE_PUBLIC_BASE}/${cleanKey}`;
  }

  const prodBackend = "https://nayantara-backend.onrender.com";
  const defaultBackend = isProd ? prodBackend : "http://localhost:5000";

  // 3. If URL contains raw objectKey (e.g. /api/v1/prescriptions/raw/prescriptions%2F... or http://localhost:5000/api/v1/prescriptions/raw/...)
  if (url && (url.includes("/prescriptions/raw/") || url.includes("/raw/"))) {
    try {
      const match = url.match(/\/raw\/(.+)$/);
      if (match && match[1]) {
        const decodedKey = decodeURIComponent(match[1]).replace(/^\/+/, "");
        return `${SUPABASE_STORAGE_PUBLIC_BASE}/${decodedKey}`;
      }
    } catch {
      // ignore decode error and proceed
    }
  }

  if (!url || url === "#") {
    if (prescriptionId) {
      return `${defaultBackend}/api/v1/prescriptions/${prescriptionId}/file`;
    }
    return "#";
  }

  // 4. Replace localhost/127.0.0.1 in production environments
  if (isProd && (url.includes("localhost:5000") || url.includes("127.0.0.1:5000"))) {
    url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, prodBackend);
  }

  // 5. If already absolute URL (e.g. Supabase signed URL or CDN), return as-is
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  // 6. If relative path (e.g. /api/v1/...), ALWAYS prepend backend origin so Vercel doesn't show 404 SPA page
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  if (normalizedPath.startsWith("/api/")) {
    const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    return `${backendOrigin || defaultBackend}${normalizedPath}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  _isRetry?: boolean;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: { code: string; fields?: Record<string, string> }; token?: string }> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Get token from options or localStorage
  const token = options.token ?? (typeof window !== "undefined" ? localStorage.getItem("nayantara_access_token") : null);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    // If 401 Unauthorized / Token Expired and not already retrying
    if (res.status === 401 && !options._isRetry && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login") && typeof window !== "undefined") {
      const storedRefreshToken = localStorage.getItem("nayantara_refresh_token");
      if (storedRefreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          const refreshData = await refreshRes.json().catch(() => ({}));
          const newAccessToken = refreshData?.data?.tokens?.accessToken || refreshData?.tokens?.accessToken;
          const newRefreshToken = refreshData?.data?.tokens?.refreshToken || refreshData?.tokens?.refreshToken;

          if (refreshRes.ok && newAccessToken) {
            localStorage.setItem("nayantara_access_token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("nayantara_refresh_token", newRefreshToken);
            }
            if (refreshData?.data?.user) {
              localStorage.setItem("nayantara_user", JSON.stringify(refreshData.data.user));
            }

            // Retry request with fresh token
            return await apiRequest<T>(endpoint, {
              ...options,
              token: newAccessToken,
              _isRetry: true,
            });
          } else {
            // Refresh token is completely dead; clear stale session
            localStorage.removeItem("nayantara_access_token");
            localStorage.removeItem("nayantara_refresh_token");
          }
        } catch {
          // Token refresh network error
        }
      } else {
        // No refresh token available, remove stale expired access token
        localStorage.removeItem("nayantara_access_token");
      }
    }

    if (!res.ok) {
      const errorMessage = data.message || "Something went wrong. Please try again.";
      return {
        success: false,
        message: errorMessage,
        error: data.error,
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
      token: data.token,
    };
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      message: "Unable to connect to server. Please ensure the backend is running.",
    };
  }
}

