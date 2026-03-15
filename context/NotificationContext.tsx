"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { CreditNotification } from "@/components/ui/CreditNotification";
import { triggerHaptic, triggerCoinSound } from "@/lib/haptic";
import { rtdb, messaging } from "@/lib/firebase";
import { ref, onValue, limitToLast, query, update, set } from "firebase/database";
import { getToken, onMessage } from "firebase/messaging";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'credit' | 'system' | 'lead' | 'achievement' | 'engagement';
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
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { BillingPopups } from "@/components/ui/BillingPopups";
import { checkEngagement } from "@/lib/engagement";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [reward, setReward] = useState<{ amount: number; id: number } | null>(null);
    const [billingPopup, setBillingPopup] = useState<{ type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached'; data?: any } | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastCredits = useRef<number | null>(null);
    const initialLoad = useRef(true);
    const swRegistration = useRef<ServiceWorkerRegistration | null>(null);

    // Request permissions and get SW registration
    useEffect(() => {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            navigator.serviceWorker.ready.then(reg => {
                swRegistration.current = reg;
            });

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

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
                    const newUnread = list.filter(n => !n.read && !notifications.find(old => old.id === n.id));
                    if (newUnread.length > 0) {
                        triggerHaptic('success');
                        triggerCoinSound();
                        
                        // Native PWA/OS Notification
                        newUnread.forEach(n => showNativeNotification(n));
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

    // Engagement & Push triggers
    useEffect(() => {
        if (user) {
            checkEngagement(user);
            setupPushNotifications(user.id);
        }
    }, [user?.id]);

    const setupPushNotifications = async (userId: string) => {
        if (!messaging || Notification.permission !== 'granted') return;

        try {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });

            if (token) {
                // Store token in RTDB for server-side push
                await set(ref(rtdb, `users/${userId}/fcmToken`), token);
                
                // Foreground listener
                onMessage(messaging, (payload) => {
                    const { title, body } = payload.notification || {};
                    if (title && body) {
                        // We already have a notification in RTDB usually, 
                        // but this handles messages sent directly via push
                        showNativeNotification({
                            id: Date.now().toString(),
                            title,
                            message: body,
                            type: 'system',
                            timestamp: Date.now(),
                            read: false
                        });
                    }
                });
            }
        } catch (error) {
            console.error("[FCM] Error setting up push:", error);
        }
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        const notifRef = ref(rtdb, `users/${user.id}/notifications/${id}`);
        await update(notifRef, { read: true });
    };

    const markAllAsRead = async () => {
        if (!user || notifications.length === 0) return;
        const updates: any = {};
        notifications.forEach(n => {
            if (!n.read) {
                updates[`users/${user.id}/notifications/${n.id}/read`] = true;
            }
        });
        if (Object.keys(updates).length > 0) {
            await update(ref(rtdb), updates);
        }
    };

    const showReward = (amount: number) => {
        setReward({ amount, id: Date.now() });
        triggerHaptic('success');
        triggerCoinSound();
    };

    const showBillingPopup = (type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached', data?: any) => {
        // Guard: Don't show trial expiring if user has credits remaining even if trial duration is low
        if (type === 'trial_expiring' && (user?.credits || 0) > 100) {
            return;
        }

        setBillingPopup({ type, data });
        triggerHaptic('warning');
    };

    const showNativeNotification = (n: NotificationItem) => {
        if (Notification.permission !== 'granted') return;

        const options: NotificationOptions = {
            body: n.message,
            icon: '/icon-512x512.png',
            badge: '/favicon.png',
            tag: n.id,
            data: { url: '/notifications' }
        };

        if (swRegistration.current) {
            swRegistration.current.showNotification(n.title || "Domvia ✨", options);
        } else {
            new Notification(n.title || "Domvia ✨", options);
        }
    };

    return (
        <NotificationContext.Provider value={{ showReward, showBillingPopup, unreadCount, notifications, markAsRead, markAllAsRead }}>
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
