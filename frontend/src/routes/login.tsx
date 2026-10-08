import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const Route = createFileRoute("/login")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Sign In — Nayantara Opticals" },
      { name: "description", content: "Sign in to your Nayantara Opticals account." },
    ],
  }),
  component: LoginPage,
});

type AuthTab = "signin" | "phone-otp" | "register";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isAdmin, isStrictOwner } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Phone OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // 2FA Security Challenge State for Super Admin
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  // Handle Google OAuth 2.0 Redirect from Backend
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const googleAuthStatus = params.get("google_auth");
    const googleToken = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error(decodeURIComponent(error));
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (googleAuthStatus === "success" && googleToken) {
      const userParam = params.get("user");
      const refreshToken = params.get("refreshToken") || undefined;
      let parsedUser = null;
      if (userParam) {
        try {
          parsedUser = JSON.parse(decodeURIComponent(userParam));
        } catch {
          // Fallback to fetch below
        }
      }

      if (parsedUser) {
        login(googleToken, parsedUser, refreshToken);
        toast.success(
          `Welcome to Nayantara Opticals, ${
            parsedUser.customerProfile?.fullName || parsedUser.fullName || "Valued Customer"
          }!`
        );
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate({ to: "/account" });
      } else {
        // Fetch full profile from API
        apiRequest<{ data: import("@/store/auth").UserProfile }>("/auth/me", {
          token: googleToken,
        }).then((res) => {
          if (res.success && res.data) {
            login(googleToken, res.data as any, refreshToken);
            toast.success("Signed in with Google successfully!");
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate({ to: "/account" });
          }
        });
      }
    }
  }, [login, navigate]);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="surface-glass rounded-2xl p-8 text-center shadow-lift">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{user.email || user.phone}</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isAdmin ? (
              <Button asChild variant="hero">
                <Link to="/admin">Admin Console</Link>
              </Button>
            ) : isStrictOwner ? (
              <Button asChild variant="hero">
                <Link to="/owner">Store Management</Link>
              </Button>
            ) : (
              <Button asChild variant="hero">
                <Link to="/account">My Account & Prescriptions</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/shop">Explore Eyewear</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Unified Sign In
  const handleUnifiedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await apiRequest<{
      requires2FA?: boolean;
      twoFactorToken?: string;
      message?: string;
      tokens?: { accessToken: string; refreshToken: string };
      user?: import("@/store/auth").UserProfile;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });

    setLoading(false);

    if (res.success && res.data) {
      if (res.data.requires2FA && res.data.twoFactorToken) {
        setRequires2FA(true);
        setTwoFactorToken(res.data.twoFactorToken);
        toast.info("Security code required to verify identity.");
        return;
      }

      if (res.data.tokens && res.data.user) {
        login(res.data.tokens.accessToken, res.data.user, res.data.tokens.refreshToken);
        const role = res.data.user.role;

        if (role === "SUPER_ADMIN") {
          toast.success("Welcome back!");
          navigate({ to: "/admin" });
        } else if (role === "OWNER") {
          toast.success("Welcome back!");
          navigate({ to: "/owner" });
        } else {
          toast.success("Welcome back to Nayantara Opticals!");
          navigate({ to: "/" });
        }
      }
    } else {
      toast.error(res.message || "Failed to sign in. Please check your credentials.");
    }
  };

  // 2. Verify 2FA
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length < 6) {
      toast.error("Please enter the 6-digit security code.");
      return;
    }

    setVerifying2FA(true);
    const res = await apiRequest<{
      tokens: { accessToken: string; refreshToken: string };
      user: import("@/store/auth").UserProfile;
    }>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({
        twoFactorToken,
        code: twoFactorCode.trim(),
      }),
    });
    setVerifying2FA(false);

    if (res.success && res.data) {
      login(res.data.tokens.accessToken, res.data.user, res.data.tokens.refreshToken);
      toast.success("Identity verified successfully!");
      navigate({ to: "/admin" });
    } else {
      toast.error(res.message || "Invalid verification code.");
    }
  };

  // 3. Customer Registration
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      toast.error("Please agree to the Terms & Conditions and Privacy Policy to register.");
      return;
    }
    setLoading(true);

    const res = await apiRequest<{
      tokens: { accessToken: string; refreshToken: string };
      user: import("@/store/auth").UserProfile;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
        whatsappOptIn,
      }),
    });

    setLoading(false);
    if (res.success && res.data) {
      login(res.data.tokens.accessToken, res.data.user, res.data.tokens.refreshToken);
      toast.success("Account created successfully! Welcome to Nayantara Opticals.");
      navigate({ to: "/" });
    } else {
      toast.error(res.message || "Registration failed. Please try again.");
    }
  };

  // 4. Request Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const res = await apiRequest("/auth/phone-otp/request", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber, purpose: "LOGIN" }),
    });
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      toast.success("6-digit OTP sent to your mobile number.");
      const timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(res.message || "Failed to send OTP.");
    }
  };

  // 5. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    const res = await apiRequest<{
      tokens: { accessToken: string; refreshToken: string };
      user: import("@/store/auth").UserProfile;
    }>("/auth/phone-otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber, otp: otpCode, purpose: "LOGIN" }),
    });
    setLoading(false);

    if (res.success && res.data) {
      login(res.data.tokens.accessToken, res.data.user, res.data.tokens.refreshToken);
      toast.success("Signed in successfully. Welcome!");
      navigate({ to: "/" });
    } else {
      toast.error(res.message || "Invalid OTP. Please check and try again.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-background py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Subtle Luxury Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto max-w-md">
        {/* Brand Banner */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {requires2FA ? "Security Verification" : "Sign In to Your Account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {requires2FA
              ? "Enter your 6-digit security authentication code."
              : "Access your prescriptions, orders, appointments, and optical profile."}
          </p>
        </div>

        {/* 2FA Challenge View */}
        {requires2FA ? (
          <div className="surface-glass mt-6 rounded-2xl p-6 sm:p-8 shadow-lift">
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <Label htmlFor="twoFactorCode" className="text-xs font-medium text-foreground">
                  6-Digit Security Code
                </Label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twoFactorCode"
                    type="text"
                    maxLength={6}
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="pl-9 text-center text-lg font-bold tracking-widest"
                  />
                </div>
              </div>

              <Button type="submit" disabled={verifying2FA} variant="hero" className="w-full mt-2">
                {verifying2FA ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Verify & Continue
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFactorToken("");
                    setTwoFactorCode("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Cancel and return to Sign In
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Clean Segmented Tabs */}
            <div className="mt-8 grid grid-cols-3 gap-1 rounded-xl border border-border/80 bg-muted/60 p-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`rounded-lg py-2 transition-all ${
                  activeTab === "signin"
                    ? "bg-card font-semibold text-foreground shadow-soft"
                    : "hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("phone-otp")}
                className={`rounded-lg py-2 transition-all ${
                  activeTab === "phone-otp"
                    ? "bg-card font-semibold text-foreground shadow-soft"
                    : "hover:text-foreground"
                }`}
              >
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`rounded-lg py-2 transition-all ${
                  activeTab === "register"
                    ? "bg-card font-semibold text-foreground shadow-soft"
                    : "hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Clean Form Container */}
            <div className="surface-glass mt-6 rounded-2xl p-6 sm:p-8 shadow-lift">
              {/* Google Authentication */}
              <div className="space-y-4 mb-6">
                <GoogleAuthButton
                  label={
                    activeTab === "register"
                      ? "Sign up with Google"
                      : "Continue with Google"
                  }
                />

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border/60" />
                  <span className="relative bg-card px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    or continue with {activeTab === "phone-otp" ? "phone OTP" : activeTab === "register" ? "email" : "password"}
                  </span>
                </div>
              </div>

              {/* TAB 1: Unified Sign In Form */}
              {activeTab === "signin" ? (
                <form onSubmit={handleUnifiedLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="identifier" className="text-xs font-medium text-foreground">
                      Email or Mobile Number
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="identifier"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="name@example.com or mobile"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium text-foreground">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          if (!identifier) toast.error("Please enter your email or phone above first.");
                          else {
                            apiRequest("/auth/forgot-password/request", {
                              method: "POST",
                              body: JSON.stringify({ identifier }),
                            });
                            toast.success("Password reset instructions sent.");
                          }
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-1.5">
                      <Lock className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 pl-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} variant="hero" className="w-full mt-2">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                </form>
              ) : null}

              {/* TAB 2: Phone OTP Login */}
              {activeTab === "phone-otp" ? (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                          Mobile Number
                        </Label>
                        <div className="relative mt-1.5">
                          <span className="pointer-events-none absolute top-2.5 left-3 text-sm font-medium text-muted-foreground">
                            +91
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            maxLength={10}
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="9876543210"
                            className="pl-12"
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          We will send a 6-digit verification code via SMS.
                        </p>
                      </div>

                      <Button type="submit" disabled={loading} variant="hero" className="w-full">
                        {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                        Send Verification OTP
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                        OTP sent to <span className="font-semibold">+91 {phoneNumber}</span>.
                      </div>

                      <div>
                        <Label htmlFor="otp" className="text-xs font-medium text-foreground">
                          Enter 6-Digit OTP
                        </Label>
                        <Input
                          id="otp"
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className="mt-1.5 text-center text-lg font-bold tracking-widest"
                        />
                      </div>

                      <Button type="submit" disabled={loading} variant="hero" className="w-full">
                        {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Verify & Sign In
                      </Button>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="hover:underline"
                        >
                          Change Number
                        </button>
                        {otpCountdown > 0 ? (
                          <span>Resend in {otpCountdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="font-medium text-primary hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              ) : null}

              {/* TAB 3: New Account Registration */}
              {activeTab === "register" ? (
                <form onSubmit={handleCustomerRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regEmail" className="text-xs font-medium text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="regEmail"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regPhone" className="text-xs font-medium text-foreground">
                      Mobile Number (Optional)
                    </Label>
                    <Input
                      id="regPhone"
                      type="tel"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regPassword" className="text-xs font-medium text-foreground">
                      Password (min 8 chars)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="whatsappOptIn"
                      checked={whatsappOptIn}
                      onChange={(e) => setWhatsappOptIn(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="whatsappOptIn" className="text-xs text-muted-foreground">
                      Receive prescription records and checkup reminders on WhatsApp.
                    </label>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="termsAgreed"
                      required
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="termsAgreed" className="text-xs text-muted-foreground leading-snug">
                      I agree to Nayantara Opticals'{" "}
                      <Link to="/terms" target="_blank" className="font-medium text-primary hover:underline">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" target="_blank" className="font-medium text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <Button type="submit" disabled={loading} variant="hero" className="w-full mt-2">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Create Account
                  </Button>
                </form>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
