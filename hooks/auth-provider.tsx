"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";
import { auth, rtdb } from "@/lib/firebase";
import { ref, get, set, onValue } from "firebase/database";
import { toast } from "sonner";

export type UserRole = "ADMIN_MASTER" | "ADMIN" | "CORRETOR" | "AGENCY_ADMIN" | "AGENCY_MEMBER";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    planId: string;
    plan?: string;
    photoURL?: string;
    simulatorLevel?: "basic" | "advanced" | "professional";
    credits: number;
    bonusCredits?: number;
    lastActivity?: number;
    referredCount?: number;
    inviteCode?: string;
    phone?: string;
    creci?: string;
    logoURL?: string;
    useLogoInDocs?: boolean;
}

interface AuthContextType {
    user: User | null;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (e: string, p: string) => Promise<void>;
    registerWithEmail: (e: string, p: string, n: string) => Promise<void>;
    resetPassword: (e: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Fetch user data from RTDB ────────────────────────────────────
async function fetchUserFromDB(firebaseUser: FirebaseUser, inviteFromParams?: string): Promise<User> {
    const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
    const snap = await get(userRef);

    if (snap.exists()) {
        const data = snap.val();
        const rawPlan = data.planId ?? data.plan ?? "trial";
        const normalizedPlanId = rawPlan.toLowerCase();
        
        return {
            id: firebaseUser.uid,
            name: data.name ?? firebaseUser.displayName ?? "Usuário",
            email: data.email ?? firebaseUser.email ?? "",
            photoURL: data.photoURL ?? firebaseUser.photoURL ?? "",
            role: (data.role as UserRole) ?? "CORRETOR",
            planId: normalizedPlanId,
            plan: data.plan ?? (normalizedPlanId.charAt(0).toUpperCase() + normalizedPlanId.slice(1)),
            simulatorLevel: data.simulatorLevel,
            credits: data.credits ?? 0,
            bonusCredits: data.bonusCredits ?? 0,
            lastActivity: data.lastActivity ?? Date.now(),
            referredCount: data.referredCount ?? 0,
            inviteCode: data.inviteCode,
            phone: data.phone,
            creci: data.creci,
            logoURL: data.logoURL,
            useLogoInDocs: data.useLogoInDocs ?? true,
        };
    }

    // First time user — create record with CORRETOR role
    const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Initial welcome notification
    const welcomeNotifId = `welcome_${Date.now()}`;
    const initialNotifications = {
        [welcomeNotifId]: {
            title: "Bem-vindo ao Domvia! 🚀",
            message: "Estamos muito felizes em ter você aqui. Que tal começar criando seu primeiro link inteligente?",
            type: "system",
            timestamp: Date.now(),
            read: false
        }
    };

    const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? "Usuário",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? "",
        role: "CORRETOR",
        planId: "trial",
        plan: "Trial",
        credits: 20,
        inviteCode: newInviteCode,
    };

    const userData = {
        name: newUser.name,
        email: newUser.email,
        photoURL: newUser.photoURL,
        role: newUser.role,
        plan: "Trial",
        planId: "trial",
        status: "active",
        createdAt: Date.now(),
        simulatorLevel: "basic",
        credits: 20,
        inviteCode: newInviteCode,
        referredBy: inviteFromParams || null,
        notifications: initialNotifications // Add initial notification
    };

    await set(userRef, userData);

    // If there is an inviteFromParams, reward the referrer and the new user
    if (inviteFromParams) {
        try {
            console.log(`[Referral] Checking code: ${inviteFromParams}`);
            // We need to look up who has this invite code
            const usersRef = ref(rtdb, "users");
            const snapAll = await get(usersRef);
            if (snapAll.exists()) {
                const usersVal = snapAll.val();
                const referrerId = Object.keys(usersVal).find(uid => usersVal[uid]?.inviteCode === inviteFromParams);
                if (referrerId && referrerId !== firebaseUser.uid) {
                    console.log(`[Referral] Found referrer: ${referrerId}`);
                    // Use the new consolidated referral processing logic
                    const { processReferral } = require("@/lib/credits");
                    await processReferral(referrerId, firebaseUser.uid);
                    
                    // Clear the stored invite code so it's only used once
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem("lb_pending_invite");
                    }
                } else {
                    console.warn(`[Referral] Invalid referrer or self-referral: ${inviteFromParams}`);
                }
            }
        } catch (e) {
            console.error("Failed to process referral credits", e);
        }
    }

    return newUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Capture pending invite code from URL
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const invite = urlParams.get("invite");
            if (invite) {
                localStorage.setItem("lb_pending_invite", invite);
                console.log(`[Auth] Saved pending invite: ${invite}`);
            }
        }

        let dbUnsubscribe: (() => void) | null = null;

        // 0. Handle Redirect Result (from Google Login on Mobile)
        const handleRedirect = async () => {
            try {
                console.log("[Auth] Checking redirect result...");
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("[Auth] Redirect result found for:", result.user.email);
                    const pendingInvite = localStorage.getItem("lb_pending_invite") || undefined;
                    const mappedUser = await fetchUserFromDB(result.user, pendingInvite);
                    setUser(mappedUser);
                    localStorage.setItem("lb_user", JSON.stringify(mappedUser));
                    
                    if (mappedUser.role === "ADMIN_MASTER" || mappedUser.role === "ADMIN") {
                        router.push("/admin/dashboard");
                    } else {
                        toast.success("Bem-vindo ao Domvia! ✨");
                        router.push("/dashboard");
                    }
                } else {
                    console.log("[Auth] No redirect result found (standard load)");
                }
            } catch (error: any) {
                console.error("[Auth] Redirect result error:", error);
                if (error.code !== 'auth/internal-error') {
                    toast.error("Erro no login: " + error.message);
                }
            }
        };
        handleRedirect();

        const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // 1. Initial manual fetch (for registration/metadata)
                const pendingInvite = localStorage.getItem("lb_pending_invite") || undefined;
                const initialUser = await fetchUserFromDB(firebaseUser, pendingInvite);
                setUser(initialUser);
                localStorage.setItem("lb_user", JSON.stringify(initialUser));

                // 2. Setup Real-time Listener for user data (Credits, Role, Plan, etc.)
                const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
                dbUnsubscribe = onValue(userRef, (snap) => {
                    if (snap.exists()) {
                        const data = snap.val();
                        const rawPlan = data.planId ?? data.plan ?? "trial";
                        const normalizedPlanId = rawPlan.toLowerCase();
                        
                        const updatedUser: User = {
                            id: firebaseUser.uid,
                            name: data.name ?? firebaseUser.displayName ?? initialUser.name,
                            email: data.email ?? firebaseUser.email ?? initialUser.email,
                            photoURL: data.photoURL ?? firebaseUser.photoURL ?? initialUser.photoURL,
                            role: (data.role as UserRole) ?? initialUser.role,
                            planId: normalizedPlanId,
                            plan: data.plan ?? (normalizedPlanId.charAt(0).toUpperCase() + normalizedPlanId.slice(1)),
                            credits: data.credits ?? 0,
                            bonusCredits: data.bonusCredits ?? 0,
                            phone: data.phone,
                            creci: data.creci,
                            logoURL: data.logoURL,
                            useLogoInDocs: data.useLogoInDocs ?? true,
                        };
                        setUser(updatedUser);
                        localStorage.setItem("lb_user", JSON.stringify(updatedUser));
                    }
                });

                // Auto-redirect to dashboard if user lands on home while logged in
                if (window.location.pathname === "/") {
                    if (initialUser.role === "ADMIN_MASTER" || initialUser.role === "ADMIN") {
                        router.push("/admin/dashboard");
                    } else {
                        router.push("/dashboard");
                    }
                }
            } else {
                setUser(null);
                localStorage.removeItem("lb_user");
                if (dbUnsubscribe) {
                    dbUnsubscribe();
                    dbUnsubscribe = null;
                }
            }
            setIsLoading(false);
        });

        return () => {
            authUnsubscribe();
            if (dbUnsubscribe) dbUnsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            console.log("[Auth] Initiating Google Login...");
            const ua = window.navigator.userAgent.toLowerCase();
            const isInstagram = /instagram|fbav|messenger/.test(ua);

            if (isInstagram) {
                console.log("[Auth] In-app browser (Instagram/FB) detected, forcing Redirect");
                await signInWithRedirect(auth, provider);
                return;
            }

            try {
                // Try Popup first as it's more reliable for state persistence in most modern mobile browsers
                // If it fails (e.g. popup blocked), we fallback to Redirect
                console.log("[Auth] Attempting signInWithPopup...");
                const result = await signInWithPopup(auth, provider);
                const pendingInvite = localStorage.getItem("lb_pending_invite") || undefined;
                const mappedUser = await fetchUserFromDB(result.user, pendingInvite);
                setUser(mappedUser);
                localStorage.setItem("lb_user", JSON.stringify(mappedUser));

                if (mappedUser.role === "ADMIN_MASTER" || mappedUser.role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    toast.success("Bem-vindo ao Domvia! ✨");
                    router.push("/dashboard");
                }
            } catch (popupErr: any) {
                console.warn("[Auth] Popup failed/blocked, falling back to Redirect", popupErr);
                if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request' || popupErr.code === 'auth/popup-closed-by-user') {
                    await signInWithRedirect(auth, provider);
                } else {
                    throw popupErr;
                }
            }
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            toast.error("Erro ao entrar com Google: " + (error.message || "Tente novamente."));
            throw error;
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, pass);
            const mappedUser = await fetchUserFromDB(result.user);
            setUser(mappedUser);
            localStorage.setItem("lb_user", JSON.stringify(mappedUser));
            
            if (mappedUser.role === "ADMIN_MASTER" || mappedUser.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else {
                toast.success("Bem-vindo ao Domvia! ✨");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const registerWithEmail = async (email: string, pass: string, name: string) => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const inviteParam = urlParams.get("invite");
            
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(result.user, { displayName: name });
            const mappedUser = await fetchUserFromDB(result.user, inviteParam || undefined);
            
            setUser(mappedUser);
            localStorage.setItem("lb_user", JSON.stringify(mappedUser));
            toast.success("Bem-vindo ao Domvia! ✨");
            router.push("/dashboard");
        } catch (error) {
            console.error("Register failed:", error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Password reset failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
