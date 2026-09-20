import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:flex sm:items-end sm:justify-between",
        align === "center" && "sm:block sm:text-center",
        className,
      )}
    >
      <div className={cn("min-w-0 max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-1.5 text-2xl leading-tight font-semibold sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-balance-pretty mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn("shrink-0", align === "center" && "mt-6")}>{action}</div> : null}
    </div>
  );
}
