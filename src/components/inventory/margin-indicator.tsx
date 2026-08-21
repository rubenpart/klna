"use client";

import { cn } from "@/lib/utils";
import type { MarginTier } from "@/types";
import { getMarginTierLabel } from "@/lib/margin";

interface MarginIndicatorProps {
  marginRate: number;
  netMargin: number;
  tier: MarginTier;
  compact?: boolean;
}

const tierStyles: Record<MarginTier, { bg: string; text: string; dot: string }> = {
  high: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  medium: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  loss: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

export function MarginIndicator({ marginRate, netMargin, tier, compact }: MarginIndicatorProps) {
  const styles = tierStyles[tier];

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono font-semibold tabular-nums border",
          styles.bg,
          styles.text
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
        {marginRate.toFixed(1)}%
      </span>
    );
  }

  return (
    <div className={cn("rounded-lg border p-2", styles.bg)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", styles.text)}>{getMarginTierLabel(tier)}</span>
        <span className={cn("text-sm font-bold font-mono tabular-nums", styles.text)}>
          {marginRate.toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Marge nette :{" "}
        <span className={cn("font-mono font-semibold", styles.text)}>
          {netMargin >= 0 ? "+" : ""}
          {netMargin.toFixed(0)} €
        </span>
      </div>
    </div>
  );
}
