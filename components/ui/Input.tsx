import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, leftIcon, rightIcon, wrapperClassName, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900",
                            "placeholder:text-slate-400",
                            "transition-all duration-200",
                            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";

// ── Textarea variant ────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, wrapperClassName, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                        {label}
                        {props.required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900",
                        "placeholder:text-slate-400 resize-y min-h-[100px]",
                        "transition-all duration-200",
                        "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-400 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
