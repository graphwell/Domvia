"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";
import { auth, rtdb } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

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
    credits?: number;
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
        return {
            id: firebaseUser.uid,
            name: data.name ?? firebaseUser.displayName ?? "Usuário",
            email: data.email ?? firebaseUser.email ?? "",
            photoURL: data.photoURL ?? firebaseUser.photoURL ?? "",
            role: (data.role as UserRole) ?? "CORRETOR",
            planId: data.planId ?? data.plan ?? "starter",
            plan: data.plan ?? "Trial",
            simulatorLevel: data.simulatorLevel,
            credits: data.credits ?? 0,
            inviteCode: data.inviteCode,
            phone: data.phone,
            creci: data.creci,
            logoURL: data.logoURL,
            useLogoInDocs: data.useLogoInDocs ?? true,
        };
    }

    // First time user — create record with CORRETOR role
    const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? "Usuário",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? "",
        role: "CORRETOR",
        planId: "trial",
        plan: "Trial",
        credits: 0,
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
        credits: 0,
        inviteCode: newInviteCode,
        referredBy: inviteFromParams || null,
    };

    await set(userRef, userData);

    // If there is an inviteFromParams, reward the referrer and the new user
    if (inviteFromParams) {
        try {
            // We need to look up who has this invite code
            const usersRef = ref(rtdb, "users");
            const snapAll = await get(usersRef);
            if (snapAll.exists()) {
                const usersVal = snapAll.val();
                const referrerId = Object.keys(usersVal).find(uid => usersVal[uid]?.inviteCode === inviteFromParams);
                if (referrerId && referrerId !== firebaseUser.uid) {
                    // Use the new consolidated referral processing logic
                    const { processReferral } = require("@/lib/credits");
                    await processReferral(referrerId, firebaseUser.uid);
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const mappedUser = await fetchUserFromDB(firebaseUser);
                setUser(mappedUser);
                localStorage.setItem("lb_user", JSON.stringify(mappedUser));
            } else {
                setUser(null);
                localStorage.removeItem("lb_user");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Check if there is an ?invite= in URL before signing in
            const urlParams = new URLSearchParams(window.location.search);
            const inviteParam = urlParams.get("invite");

            const result = await signInWithPopup(auth, provider);
            // Fetch user data (including role) before redirecting
            const mappedUser = await fetchUserFromDB(result.user, inviteParam || undefined);
            setUser(mappedUser);
            localStorage.setItem("lb_user", JSON.stringify(mappedUser));

            // Redirect based on role
            if (mappedUser.role === "ADMIN_MASTER" || mappedUser.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error signing in with Google:", error);
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
            router.push("/login");
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
