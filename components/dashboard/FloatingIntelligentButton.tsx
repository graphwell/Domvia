"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function FloatingIntelligentButton() {
  const [position, setPosition] = useState({ x: 20, y: 100 }); // Bottom-right initial
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved position if possible
    const saved = localStorage.getItem("floating_btn_pos");
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load button position", e);
      }
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.touches[0].clientX - position.x,
      y: window.innerHeight - e.touches[0].clientY - position.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    // Prevent scrolling while dragging
    if (e.cancelable) e.preventDefault();

    const newX = e.touches[0].clientX - dragStart.current.x;
    const newY = window.innerHeight - e.touches[0].clientY - dragStart.current.y;

    // Boundary checks
    const boundedX = Math.max(10, Math.min(newX, window.innerWidth - 70));
    const boundedY = Math.max(80, Math.min(newY, window.innerHeight - 80));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    localStorage.setItem("floating_btn_pos", JSON.stringify(position));
  };

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 transition-none lg:hidden"
      style={{
        left: `${position.x}px`,
        bottom: `${position.y}px`,
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Link href="/tools/captacao" className="block">
        <div className="relative flex items-center justify-center">
          {/* Animated Halo - Multiple layers for a premium pulse */}
          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-brand-400/10 animate-pulse scale-150" />
          
          <div className="relative h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/40 flex items-center justify-center active:scale-90 transition-transform duration-150">
            <Camera className="h-7 w-7" />
          </div>
        </div>
      </Link>
    </div>
  );
}
