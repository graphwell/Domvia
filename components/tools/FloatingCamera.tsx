"use client";

import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingCamera() {
    const pathname = usePathname();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);
    const initialPos = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });

    // Ensure it starts positioned relative to the bottom right
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 180 });
        }
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        initialPos.current = { x: touch.clientX, y: touch.clientY };
        offset.current = { x: position.x, y: position.y };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        // Prevent default to avoid scrolling while dragging
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - initialPos.current.x;
        const dy = touch.clientY - initialPos.current.y;
        
        let newX = offset.current.x + dx;
        let newY = offset.current.y + dy;

        // Keep inside screen bounds
        if (typeof window !== "undefined") {
            const maxX = window.innerWidth - 70;
            const maxY = window.innerHeight - 70;
            newX = Math.max(10, Math.min(newX, maxX));
            newY = Math.max(10, Math.min(newY, maxY));
        }

        setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Hide if already inside Captação to avoid redundancy
    if (pathname === "/tools/captacao" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
        return null;
    }

    return (
        <div
            ref={dragRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                top: position.y,
                left: position.x,
            }}
            className="fixed z-50 sm:hidden touch-none"
        >
            <Link href="/tools/captacao" onClick={(e) => isDragging && e.preventDefault()}>
                <button className={`flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-full h-16 w-16 shadow-2xl shadow-brand-500/60 transition-transform ${isDragging ? 'scale-110 cursor-grabbing' : 'active:scale-95 cursor-grab'} border-4 border-white`}>
                    <Camera className="h-8 w-8" />
                </button>
            </Link>
        </div>
    );
}
