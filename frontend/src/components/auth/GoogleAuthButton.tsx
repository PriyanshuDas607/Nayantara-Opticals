import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type UserProfile } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface GoogleAuthButtonProps {
  label?: string;
  className?: string;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const googleClientId =
    (import.meta.env as Record<string, string | undefined>)["VITE_GOOGLE_CLIENT_ID"] || "";

  // Initialize official Google Identity Services if client ID is ready in browser
  useEffect(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id || !googleClientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          try {
            const res = await apiRequest<{
              tokens: { accessToken: string; refreshToken: string };
              user: UserProfile;
            }>("/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential: response.credential }),
            });

            if (res.success && res.data) {
              login(res.data.tokens.accessToken, res.data.user, res.data.tokens.refreshToken);
              toast.success(`Welcome, ${res.data.user.customerProfile?.fullName || "back"}!`);
              window.location.href = "/account";
            } else {
              toast.error(res.message || "Google verification failed.");
            }
          } catch {
            toast.error("Network error during Google verification.");
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch {
      // Ignored
    }
  }, [googleClientId, login]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Real Google OAuth 2.0 flow configured with user's Google Console redirect URI
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`relative w-full h-11 border-border/80 bg-background/90 hover:bg-muted/70 text-foreground font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer ${className}`}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <GoogleIcon className="h-5 w-5 shrink-0" />
      )}
      <span>{loading ? "Redirecting to Google..." : label}</span>
    </Button>
  );
}
