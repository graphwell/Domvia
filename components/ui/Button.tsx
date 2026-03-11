import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
    {
        variants: {
            variant: {
                primary:
                    "bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:shadow-glow",
                secondary:
                    "bg-white text-brand-700 border border-brand-200 shadow-sm hover:bg-brand-50 hover:border-brand-300",
                ghost:
                    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                danger:
                    "bg-red-600 text-white shadow-sm hover:bg-red-700",
                gold:
                    "bg-gold-500 text-white shadow-md hover:bg-gold-600 hover:shadow-glow-gold",
                outline:
                    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
                "whatsapp":
                    "bg-[#25D366] text-white shadow-md hover:bg-[#20ba59] hover:shadow-lg",
            },
            size: {
                sm: "h-8  px-3  text-xs",
                md: "h-10 px-4  text-sm",
                lg: "h-12 px-6  text-base",
                xl: "h-14 px-8  text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, leftIcon, rightIcon, asChild = false, children, disabled, ...props }, ref) => {
        if (asChild) {
            return (
                <Slot
                    ref={ref as any}
                    className={cn(buttonVariants({ variant, size }), className)}
                    {...props}
                >
                    {children}
                </Slot>
            );
        }

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
