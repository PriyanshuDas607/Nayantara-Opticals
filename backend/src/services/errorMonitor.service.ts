export interface SystemErrorIncident {
  id: string;
  type: "SERVER_ERROR" | "CLIENT_RUNTIME_ERROR" | "DATABASE_ERROR" | "AUTH_ERROR" | "NETWORK_ERROR";
  statusCode: number;
  method?: string;
  endpoint: string;
  message: string;
  stackTrace?: string;
  source: "BACKEND_API" | "FRONTEND_CLIENT";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  count: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
}

export interface ErrorMonitoringSummary {
  totalErrors: number;
  criticalErrors: number;
  unresolvedErrors: number;
  clientErrors: number;
  systemHealth: "OPTIMAL" | "DEGRADED" | "NEEDS_ATTENTION";
  errorRatePercent: number;
  lastIncidentAt?: string;
  incidents: SystemErrorIncident[];
}

class ErrorMonitorStore {
  private incidents: SystemErrorIncident[] = [];
  private maxCapacity = 200;

  constructor() {
    this.incidents = [];
  }

  /**
   * Records a backend or frontend error incident with deduplication
   */
  public recordError(data: {
    type?: "SERVER_ERROR" | "CLIENT_RUNTIME_ERROR" | "DATABASE_ERROR" | "AUTH_ERROR" | "NETWORK_ERROR";
    statusCode?: number;
    method?: string;
    endpoint: string;
    message: string;
    stackTrace?: string;
    source?: "BACKEND_API" | "FRONTEND_CLIENT";
    userAgent?: string;
    ipAddress?: string;
    userId?: string;
  }): SystemErrorIncident {
    const cleanEndpoint = data.endpoint || "/unknown";
    const cleanMessage = (data.message || "Unknown error occurred").trim();
    const source = data.source || (data.statusCode ? "BACKEND_API" : "FRONTEND_CLIENT");
    const statusCode = data.statusCode || 500;

    // Deduplicate matching endpoint + message + source
    const existing = this.incidents.find(
      (inc) =>
        inc.endpoint === cleanEndpoint &&
        inc.message === cleanMessage &&
        inc.source === source &&
        inc.status !== "RESOLVED"
    );

    if (existing) {
      existing.count += 1;
      existing.lastOccurredAt = new Date().toISOString();
      if (data.stackTrace) existing.stackTrace = data.stackTrace;
      if (data.userId) existing.userId = data.userId;
      return existing;
    }

    const newIncident: SystemErrorIncident = {
      id: `err-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type:
        data.type ||
        (statusCode >= 500
          ? "SERVER_ERROR"
          : statusCode === 401 || statusCode === 403
          ? "AUTH_ERROR"
          : source === "FRONTEND_CLIENT"
          ? "CLIENT_RUNTIME_ERROR"
          : "SERVER_ERROR"),
      statusCode,
      method: data.method?.toUpperCase() || (source === "FRONTEND_CLIENT" ? "CLIENT_EVENT" : "GET"),
      endpoint: cleanEndpoint,
      message: cleanMessage,
      stackTrace: data.stackTrace,
      source,
      status: "OPEN",
      count: 1,
      firstOccurredAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      userId: data.userId,
    };

    this.incidents.unshift(newIncident);
    if (this.incidents.length > this.maxCapacity) {
      this.incidents = this.incidents.slice(0, this.maxCapacity);
    }

    return newIncident;
  }

  /**
   * Updates incident status (e.g. mark as RESOLVED or INVESTIGATING)
   */
  public updateStatus(id: string, status: "OPEN" | "INVESTIGATING" | "RESOLVED"): SystemErrorIncident | null {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) return null;
    incident.status = status;
    return incident;
  }

  /**
   * Clears resolved incidents
   */
  public clearResolved(): number {
    const beforeCount = this.incidents.length;
    this.incidents = this.incidents.filter((i) => i.status !== "RESOLVED");
    return beforeCount - this.incidents.length;
  }

  /**
   * Summary overview for Super Admin dashboard
   */
  public getSummary(): ErrorMonitoringSummary {
    const totalErrors = this.incidents.reduce((sum, i) => sum + i.count, 0);
    const criticalErrors = this.incidents
      .filter((i) => i.statusCode >= 500 && i.status !== "RESOLVED")
      .reduce((sum, i) => sum + i.count, 0);
    const unresolvedErrors = this.incidents.filter((i) => i.status !== "RESOLVED").length;
    const clientErrors = this.incidents.filter((i) => i.source === "FRONTEND_CLIENT").length;

    let systemHealth: "OPTIMAL" | "DEGRADED" | "NEEDS_ATTENTION" = "OPTIMAL";
    if (criticalErrors > 5) {
      systemHealth = "NEEDS_ATTENTION";
    } else if (unresolvedErrors > 0 || criticalErrors > 0) {
      systemHealth = "DEGRADED";
    }

    const lastIncident = this.incidents[0];

    return {
      totalErrors,
      criticalErrors,
      unresolvedErrors,
      clientErrors,
      systemHealth,
      errorRatePercent: totalErrors > 0 ? +(Math.min(100, (criticalErrors / totalErrors) * 100)).toFixed(2) : 0.0,
      lastIncidentAt: lastIncident?.lastOccurredAt,
      incidents: this.incidents,
    };
  }
}

export const errorMonitor = new ErrorMonitorStore();
