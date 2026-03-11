"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

export interface BrandingData {
    logoBase64?: string;
    stampBase64?: string;
    brandName?: string;
    creci?: string;
    phone?: string;
    email?: string;
    company?: string;
}

export function useBranding() {
    const { user } = useAuth();
    const [branding, setBranding] = useState<BrandingData>({});
    const [loading, setLoading] = useState(true);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load from Firebase on mount
    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        const brandRef = ref(rtdb, `users/${user.id}/branding`);
        get(brandRef).then((snap) => {
            if (snap.exists()) setBranding(snap.val());
        }).finally(() => setLoading(false));
    }, [user?.id]);

    // Debounced save
    const save = useCallback((data: BrandingData) => {
        if (!user?.id) return;
        setBranding(data);
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            const brandRef = ref(rtdb, `users/${user.id}/branding`);
            set(brandRef, data).catch(console.error);
        }, 1000);
    }, [user?.id]);

    const update = useCallback((patch: Partial<BrandingData>) => {
        setBranding((prev) => {
            const next = { ...prev, ...patch };
            save(next);
            return next;
        });
    }, [save]);

    const removeLogo = useCallback(() => update({ logoBase64: undefined }), [update]);
    const removeStamp = useCallback(() => update({ stampBase64: undefined }), [update]);

    return { branding, update, removeLogo, removeStamp, loading };
}
