import { toast } from "sonner";

const rawApiUrl =
  (import.meta.env as Record<string, string | undefined>)["VITE_API_URL"] ||
  "http://localhost:5000/api/v1";
const API_BASE_URL = rawApiUrl.trim().replace(/\/$/, "");

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

