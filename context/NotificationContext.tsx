"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { CreditNotification } from "@/components/ui/CreditNotification";
import { triggerHaptic, triggerCoinSound } from "@/lib/haptic";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, limitToLast, query } from "firebase/database";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'credit' | 'system' | 'lead' | 'achievement';
    timestamp: number;
    read: boolean;
    amount?: number;
}

interface NotificationContextType {
    showReward: (amount: number) => void;
    showBillingPopup: (type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached', data?: any) => void;
    unreadCount: number;
    notifications: NotificationItem[];
    markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { BillingPopups } from "@/components/ui/BillingPopups";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [reward, setReward] = useState<{ amount: number; id: number } | null>(null);
    const [billingPopup, setBillingPopup] = useState<{ type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached'; data?: any } | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastCredits = useRef<number | null>(null);
    const initialLoad = useRef(true);

    // Monitor credit changes
    useEffect(() => {
        if (!user) {
            lastCredits.current = null;
            return;
        }

        const currentCredits = (user as any).credits || 0;
        
        if (lastCredits.current !== null && currentCredits > lastCredits.current) {
            const diff = currentCredits - lastCredits.current;
            showReward(diff);
        }
        
        lastCredits.current = currentCredits;
    }, [user?.credits]);

    // Real-time notifications listener
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const notifRef = query(ref(rtdb, `users/${user.id}/notifications`), limitToLast(20));
        
        const unsubscribe = onValue(notifRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const list: NotificationItem[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => b.timestamp - a.timestamp);

                // Check for new unread notifications since last load to trigger sensory feedback
                if (!initialLoad.current) {
                    const hasNew = list.some(n => !n.read && !notifications.find(old => old.id === n.id));
                    if (hasNew) {
                        triggerHaptic('success');
                        triggerCoinSound();
                    }
                }

                setNotifications(list);
                setUnreadCount(list.filter(n => !n.read).length);
                initialLoad.current = false;
            } else {
                setNotifications([]);
                setUnreadCount(0);
                initialLoad.current = false;
            }
        });

        return () => unsubscribe();
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        // Implementation for marking as read in RTDB would go here
        console.log("Mark as read:", id);
    };

    const showReward = (amount: number) => {
        setReward({ amount, id: Date.now() });
        triggerHaptic('success');
        triggerCoinSound();
    };

    const showBillingPopup = (type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached', data?: any) => {
        setBillingPopup({ type, data });
        triggerHaptic('warning');
    };

    return (
        <NotificationContext.Provider value={{ showReward, showBillingPopup, unreadCount, notifications, markAsRead }}>
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
