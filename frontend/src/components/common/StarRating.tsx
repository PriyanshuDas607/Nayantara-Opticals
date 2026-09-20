import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  className,
  label,
}: {
  value: number;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label ?? `Rated ${value} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden="true"
          className={cn(
            "shrink-0",
            i + 0.5 <= value
              ? "fill-champagne text-champagne"
              : "fill-transparent text-muted-foreground/50",
          )}
        />
      ))}
    </span>
  );
}
