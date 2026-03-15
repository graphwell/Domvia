import { rtdb } from "@/lib/firebase";
import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

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
 * Reports an error or meaningful event to administrators.
 * This logs to RTDB and eventually triggers a push notification.
 */
export async function reportAdminAlert(alert: Omit<AdminAlert, 'timestamp' | 'read'>) {
    try {
        const alertsRef = ref(rtdb, 'admin/alerts');
        const newAlertRef = push(alertsRef);
        
        const fullAlert: AdminAlert = {
            ...alert,
            timestamp: Date.now(),
            read: false
        };

        await set(newAlertRef, fullAlert);

        // Trigger Push Notification for Admins
        // We call an internal API that sends the FCM message
        fetch('/api/admin/push-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullAlert)
        }).catch(err => console.error("Push alert trigger failed:", err));

        return true;
    } catch (error) {
        console.error("Failed to report admin alert:", error);
        return false;
    }
}

/**
 * Specialized helper for tool errors (failed generations, credit issues, etc).
 */
export async function reportToolError(userId: string, toolId: string, error: any, context?: any) {
    return reportAdminAlert({
        userId,
        toolId,
        severity: 'error',
        message: typeof error === 'string' ? error : (error.message || 'Erro desconhecido na ferramenta'),
        context: {
            ...context,
            rawError: error
        }
    });
}
