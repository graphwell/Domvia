"use client";

import { useAuth } from "@/hooks/auth-provider";

export function UserAvatar() {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
        : "?";

    if (user?.photoURL) {
        return (
            <img
                src={user.photoURL}
                alt={user.name}
                className="h-9 w-9 rounded-full shadow-glow cursor-pointer object-cover"
            />
        );
    }

    return (
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-glow cursor-pointer">
            {initials}
        </div>
    );
}
