import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/* ---------- Card ---------- */
const cardVariants = cva("rounded-xl border bg-surface shadow-card", {
  variants: {
    variant: {
      default: "border-border",
      highlight: "border-primary/40 bg-gradient-to-br from-surface to-primary/10 shadow-glow",
      sunken: "border-border bg-surface-sunken shadow-none",
    },
    padding: { none: "", sm: "p-4", md: "p-5", lg: "p-6" },
  },
  defaultVariants: { variant: "default", padding: "md" },
});
export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
));
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, icon, actions, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)} {...props}>
      <div className="flex items-start gap-3">
        {icon && <div className="rounded-lg border border-border bg-surface-raised p-2 text-primary">{icon}</div>}
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      </div>
      {actions}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

/* ---------- Button ---------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-primary to-primary-strong text-primary-foreground shadow-glow hover:brightness-110",
        secondary: "border border-border bg-surface-raised text-foreground hover:border-border-strong",
        ghost: "text-muted hover:bg-surface-raised hover:text-foreground",
        success: "border border-success/30 bg-success/10 text-success hover:bg-success/20",
      },
      size: { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

/* ---------- Badge ---------- */
const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", {
  variants: {
    variant: {
      neutral: "border-border bg-surface-raised text-muted",
      primary: "border-primary/30 bg-primary/10 text-primary",
      success: "border-success/30 bg-success/10 text-success",
      warning: "border-warning/30 bg-warning/10 text-warning",
      danger: "border-danger/30 bg-danger/10 text-danger",
      accent: "border-accent/30 bg-accent/10 text-accent",
    },
  },
  defaultVariants: { variant: "neutral" },
});
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";

/* ---------- SegmentedControl ---------- */
export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}
export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}
export function SegmentedControl<T extends string>({ options, value, onChange, className, ...rest }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={rest["aria-label"]} className={cn("inline-flex rounded-lg border border-border bg-surface-sunken p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active ? "bg-surface-raised text-foreground shadow-card" : "text-muted hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Slider ---------- */
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  hint?: React.ReactNode;
}
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, value, min, max, onValueChange, formatValue = (v) => `${v}%`, hint, className, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const fill = ((value - min) / (max - min)) * 100;
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">{label}</label>
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">{formatValue(value)}</span>
        </div>
        <input
          ref={ref}
          id={inputId}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="ds-range w-full"
          style={{ ["--fill" as string]: `${fill}%` }}
          {...props}
        />
        {hint && <p className="text-[11px] text-subtle">{hint}</p>}
      </div>
    );
  },
);
Slider.displayName = "Slider";

/* ---------- AnimatedNumber ---------- */
export interface AnimatedNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  format?: (value: number) => string;
  duration?: number;
}
export const AnimatedNumber = React.forwardRef<HTMLSpanElement, AnimatedNumberProps>(
  ({ value, format = (v) => Math.round(v).toLocaleString(), duration = 600, className, ...props }, ref) => {
    const [display, setDisplay] = React.useState(value);
    const from = React.useRef(value);
    React.useEffect(() => {
      const start = performance.now();
      const initial = from.current;
      let raf = 0;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const next = initial + (value - initial) * eased;
        setDisplay(next);
        from.current = next;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <span ref={ref} className={cn("tabular-nums", className)} {...props}>{format(display)}</span>;
  },
);
AnimatedNumber.displayName = "AnimatedNumber";

/* ---------- StatCard ---------- */
export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  label: string;
  value: number;
  format?: (v: number) => string;
  icon: React.ReactNode;
  trend?: React.ReactNode;
  tone?: "default" | "highlight";
}
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, format, icon, trend, tone = "default", className, ...props }, ref) => (
    <Card
      ref={ref}
      variant={tone === "highlight" ? "highlight" : "default"}
      padding="sm"
      className={cn("group transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong", className)}
      {...props}
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        <span className="rounded-md bg-surface-raised p-1.5 text-primary transition-transform group-hover:scale-110">{icon}</span>
      </div>
      <AnimatedNumber value={value} format={format} className="mt-3 block font-display text-2xl font-semibold text-foreground" />
      {trend && <div className="mt-1.5 text-xs">{trend}</div>}
    </Card>
  ),
);
StatCard.displayName = "StatCard";
