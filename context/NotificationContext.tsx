"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { CreditNotification } from "@/components/ui/CreditNotification";
import { triggerHaptic } from "@/lib/haptic";

interface NotificationContextType {
    showReward: (amount: number) => void;
    showBillingPopup: (type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached', data?: any) => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { BillingPopups } from "@/components/ui/BillingPopups";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [reward, setReward] = useState<{ amount: number; id: number } | null>(null);
    const [billingPopup, setBillingPopup] = useState<{ type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached'; data?: any } | null>(null);
    const lastCredits = useRef<number | null>(null);

    // Monitor credit changes
    useEffect(() => {
        if (user && lastCredits.current !== null) {
            // Check for credit changes specifically in RTDB to be more accurate?
            // For now, let's keep the user object sync if it's reliable
            const diff = (user as any).credits - lastCredits.current;
            if (diff > 0) {
                showReward(diff);
            }
        }
        
        if (user) {
            lastCredits.current = (user as any).credits;
        }
    }, [user?.credits]);

    const showReward = (amount: number) => {
        setReward({ amount, id: Date.now() });
        triggerHaptic('success');
    };

    const showBillingPopup = (type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached', data?: any) => {
        setBillingPopup({ type, data });
        triggerHaptic('warning');
    };

    // For now, mock unreadCount as 0. In the future, this can be synced with real DB notifications.
    const [unreadCount, setUnreadCount] = useState(0);

    return (
        <NotificationContext.Provider value={{ showReward, showBillingPopup, unreadCount }}>
            {children}
            {reward && (
                <CreditNotification 
                    key={reward.id}
                    amount={reward.amount} 
                    onClose={() => setReward(null)} 
                />
            )}
            {billingPopup && (
                <BillingPopups 
                    type={billingPopup.type}
                    data={billingPopup.data}
                    isOpen={!!billingPopup}
                    onClose={() => setBillingPopup(null)}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
