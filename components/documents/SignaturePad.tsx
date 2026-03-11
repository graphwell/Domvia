"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Trash2 } from "lucide-react";

export interface SignaturePadRef {
    getSignature: () => string | null;
    clear: () => void;
    isEmpty: () => boolean;
}

interface SignaturePadProps {
    label?: string;
    className?: string;
    onSign?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
    ({ label = "Assinatura", className = "", onSign }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const isDrawing = useRef(false);
        const hasDrawn = useRef(false);

        useImperativeHandle(ref, () => ({
            getSignature: () => {
                if (!hasDrawn.current) return null;
                return canvasRef.current?.toDataURL("image/png") ?? null;
            },
            clear: () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                hasDrawn.current = false;
            },
            isEmpty: () => !hasDrawn.current,
        }));

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }, []);

        const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
            const rect = canvas.getBoundingClientRect();
            if ("touches" in e) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top,
                };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            isDrawing.current = true;
            const pos = getPos(e, canvas);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            if (!isDrawing.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const pos = getPos(e, canvas);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            hasDrawn.current = true;
            onSign?.();
        };

        const endDraw = () => { isDrawing.current = false; };

        const clear = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasDrawn.current = false;
        };

        return (
            <div className={`space-y-1 ${className}`}>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">{label}</p>
                    <button
                        type="button"
                        onClick={clear}
                        className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="h-3 w-3" /> Limpar
                    </button>
                </div>
                <canvas
                    ref={canvasRef}
                    className="w-full border-b-2 border-slate-400 bg-slate-50 rounded-t-lg touch-none cursor-crosshair"
                    style={{ height: "96px" }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
                <p className="text-[10px] text-slate-400 text-center pt-1">Assine acima com o dedo ou mouse</p>
            </div>
        );
    }
);

SignaturePad.displayName = "SignaturePad";
