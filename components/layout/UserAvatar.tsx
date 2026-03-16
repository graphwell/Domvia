"use client";

import { useAuth } from "@/hooks/auth-provider";
import Link from "next/link";
import { triggerHaptic } from "@/lib/haptic";

export function UserAvatar() {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
        : "?";

    const content = user?.photoURL ? (
        <img
            src={user.photoURL}
            alt={user.name}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-glow cursor-pointer object-cover transition-transform hover:scale-105 active:scale-95"
        />
    ) : (
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-sm font-bold shadow-glow cursor-pointer transition-transform hover:scale-105 active:scale-95">
            {initials}
        </div>
    );

    return (
        <Link 
            href="/settings/profile" 
            onClick={() => triggerHaptic('light')}
            className="focus:outline-none"
            title="Editar Perfil"
        >
            {content}
        </Link>
    );
}
