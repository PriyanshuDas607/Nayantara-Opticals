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

export interface PrescriptionFileRef {
  objectKey?: string | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  fileDataBase64?: string | null;
}

/**
 * Resolves a prescription file or download URL.
 * Medical records are strictly authenticated with signed URLs or authenticated download paths.
 */
export function resolvePrescriptionUrl(
  url?: string | null,
  prescriptionId?: string,
  fileUpload?: PrescriptionFileRef | null
): string {
  const prodBackend = "https://nayantara-backend.onrender.com";
  const defaultBackend = isProd ? prodBackend : "http://localhost:5000";

  let tokenParam = "";
  if (typeof window !== "undefined") {
    try {
      const storedToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (storedToken) {
        tokenParam = `?token=${encodeURIComponent(storedToken)}`;
      }
    } catch {
      // ignore localStorage errors
    }
  }

  // 1. If already an absolute signed URL (Supabase S3 signed URL, blob, etc.), return as-is
  if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:"))) {
    // Replace localhost in production
    if (isProd && (url.includes("localhost:5000") || url.includes("127.0.0.1:5000"))) {
      url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, prodBackend);
    }
    // If it's a backend file URL without a token and we have one, attach token for browser download
    if (url.includes("/api/v1/prescriptions/") && !url.includes("token=") && tokenParam) {
      url = url.includes("?") ? `${url}&${tokenParam.slice(1)}` : `${url}${tokenParam}`;
    }
    return url;
  }

  // 2. Direct endpoint by prescriptionId
  if (prescriptionId) {
    return `${defaultBackend}/api/v1/prescriptions/${prescriptionId}/file${tokenParam}`;
  }

  if (!url || url === "#") {
    return "#";
  }

  // 3. Relative backend path (e.g. /api/v1/...)
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  const fullUrl = `${backendOrigin || defaultBackend}${normalizedPath}`;
  if (!fullUrl.includes("token=") && tokenParam) {
    return fullUrl.includes("?") ? `${fullUrl}&${tokenParam.slice(1)}` : `${fullUrl}${tokenParam}`;
  }
  return fullUrl;
}

/**
 * Fetches an authenticated, temporary 5-minute signed download URL for a prescription file
 */
export async function fetchPrescriptionDownloadUrl(prescriptionId: string): Promise<string> {
  const res = await apiRequest<{ downloadUrl: string }>(`/prescriptions/${prescriptionId}/download-url`);
  if (!res.success || !res.data?.downloadUrl) {
    throw new Error(res.message || "Failed to generate prescription download URL.");
  }
  return res.data.downloadUrl;
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

