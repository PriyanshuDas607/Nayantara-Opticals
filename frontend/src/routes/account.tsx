import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Calendar,
  FileText,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

export function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    // Fetch customer data
    apiRequest<any[]>("/appointments/me").then((res) => {
      if (res.success && Array.isArray(res.data)) setAppointments(res.data);
    });

    apiRequest<any[]>("/prescriptions/me").then((res) => {
      if (res.success && Array.isArray(res.data)) setPrescriptions(res.data);
    });

    apiRequest<any[]>("/orders/me").then((res) => {
      if (res.success && Array.isArray(res.data)) setOrders(res.data);
    });
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-aurora py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Profile Card */}
        <div className="surface-glass flex flex-col justify-between gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8 shadow-lift">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary font-display">
              {(user.customerProfile?.fullName || user.email || "N")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {user.customerProfile?.fullName || "Valued Customer"}
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {user.role}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {user.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                  </span>
                ) : null}
                {user.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {user.phone}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user.role === "SUPER_ADMIN" ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Super Admin Console
                </Link>
              </Button>
            ) : user.role === "OWNER" ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/owner">
                  <Store className="mr-2 h-4 w-4" /> Store Dashboard
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* 3 Columns Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Appointments */}
          <div className="surface-glass rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Appointments</h2>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {appointments.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-lg border border-border/70 bg-card p-3 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>{a.type.replace("_", " ")}</span>
                    <span className="text-primary font-semibold">{a.status}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(a.appointmentDate).toLocaleDateString()} at {a.timeSlot}
                  </p>
                </div>
              ))}
              {appointments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No upcoming eye check appointments.
                </p>
              ) : null}
              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link to="/book">Book New Checkup</Link>
              </Button>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="surface-glass rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Prescriptions</h2>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {prescriptions.slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-lg border border-border/70 bg-card p-3 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>{p.type === "FILE" ? "Doctor Upload" : "Manual Numbers"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {p.fileUpload ? (
                    <p className="mt-1 font-mono text-[11px] text-primary truncate">
                      {p.fileUpload.originalFileName}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      OD: {p.sphereOD || "0.00"} · OS: {p.sphereOS || "0.00"}
                    </p>
                  )}
                </div>
              ))}
              {prescriptions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No prescription uploaded yet.
                </p>
              ) : null}
              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link to="/prescription">Upload / Add Rx</Link>
              </Button>
            </div>
          </div>

          {/* Orders */}
          <div className="surface-glass rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Orders & Bag</h2>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="rounded-lg border border-border/70 bg-card p-3 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="font-mono">{o.orderNumber}</span>
                    <span className="text-primary font-semibold">{o.status}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    ₹{(o.totalPaise / 100).toLocaleString("en-IN")} · {o.paymentMethod}
                  </p>
                </div>
              ))}
              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No previous orders placed.
                </p>
              ) : null}
              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link to="/shop">Shop Frames</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
