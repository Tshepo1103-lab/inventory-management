import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold/30 bg-gold/15 text-gold",
        secondary: "border-border bg-muted text-muted-foreground",
        success: "border-green-500/30 bg-green-500/15 text-green-400",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-400",
        danger: "border-red-500/30 bg-red-500/15 text-red-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
