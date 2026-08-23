"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { amountToEur, formatRateLabel } from "@/lib/exchange-rates";
import { formatDate } from "@/lib/utils";
import type { Currency } from "@/types";

interface ExchangeRateFieldProps {
  currency: Currency;
  rate: number;
  manual: boolean;
  loading?: boolean;
  fetchedAt?: string | null;
  source?: "frankfurter" | "fallback" | "manual";
  amount?: number;
  onRateChange: (rate: number) => void;
  onManualChange: (manual: boolean) => void;
  onRefresh: () => void;
}

export function ExchangeRateField({
  currency,
  rate,
  manual,
  loading,
  fetchedAt,
  source,
  amount,
  onRateChange,
  onManualChange,
  onRefresh,
}: ExchangeRateFieldProps) {
  const eurEquivalent = amount != null ? amountToEur(amount, rate) : null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Taux de change → EUR
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={manual}
              onChange={(e) => onManualChange(e.target.checked)}
              className="rounded border-input"
            />
            Manuel
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={onRefresh}
            disabled={loading || currency === "EUR"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{formatRateLabel(currency, rate)}</p>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs text-muted-foreground">1 {currency} =</span>
        <Input
          type="number"
          min={0}
          step={0.0001}
          value={rate}
          readOnly={!manual && currency !== "EUR"}
          onChange={(e) => onRateChange(Number(e.target.value) || 0)}
          className="h-8 font-mono text-xs"
        />
        <span className="shrink-0 text-xs text-muted-foreground">EUR</span>
      </div>

      {eurEquivalent != null && (
        <p className="text-xs text-emerald-700">
          Équivalent : {formatCurrency(eurEquivalent, "EUR")}
          {currency !== "EUR" && (
            <span className="text-muted-foreground">
              {" "}
              ({formatCurrency(amount ?? 0, currency)})
            </span>
          )}
        </p>
      )}

      {fetchedAt && source !== "manual" && currency !== "EUR" && (
        <p className="text-[10px] text-muted-foreground">
          Taux {source === "frankfurter" ? "live" : "de secours"} —{" "}
          {formatDate(fetchedAt, { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}
