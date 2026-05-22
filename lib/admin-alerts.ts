export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface AdminAlert {
    id?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    toolId: string;
    severity: AlertSeverity;
    message: string;
    context?: any;
    timestamp: number;
    read: boolean;
}

/**
 * Reports an error to administrators.
 * The write to RTDB and FCM push happen server-side via Admin SDK,
 * so this works for any authenticated user regardless of role.
 * Fire-and-forget: never blocks the caller.
 */
export function reportAdminAlert(alert: Omit<AdminAlert, "timestamp" | "read">): void {
    fetch("/api/admin/report-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
    }).catch((err) => console.error("[AdminAlerts] Falha ao reportar alerta:", err));
}

export function reportToolError(userId: string, toolId: string, error: any, context?: any): void {
    reportAdminAlert({
        userId,
        toolId,
        severity: "error",
        message: typeof error === "string" ? error : (error?.message || "Erro desconhecido na ferramenta"),
        context: { ...context, rawError: error },
    });
}
