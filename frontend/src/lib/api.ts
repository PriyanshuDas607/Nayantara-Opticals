import { toast } from "sonner";

const API_BASE_URL =
  (import.meta.env as Record<string, string | undefined>)["VITE_API_URL"] ||
  "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<{ success: boolean; data?: T; message?: string; error?: { code: string; fields?: Record<string, string> } }> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

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

    const data = await res.json();

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
    };
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      message: "Unable to connect to server. Please ensure the backend is running.",
    };
  }
}
