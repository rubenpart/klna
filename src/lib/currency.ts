import type { Currency } from "@/types";

/** Taux de conversion simplifiés vers EUR (base interne pour marges) */
export const EXCHANGE_RATES_TO_EUR: Record<Currency, number> = {
  EUR: 1,
  USD: 0.92,
  AED: 0.25,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  AED: "AED",
};

export function convertToEur(amount: number, currency: Currency): number {
  return amount * EXCHANGE_RATES_TO_EUR[currency];
}

export function formatCurrency(
  amount: number,
  currency: Currency = "EUR",
  options?: { compact?: boolean }
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: options?.compact ? "compact" : "standard",
  }).format(amount);

  if (currency === "AED") return `${formatted} ${symbol}`;
  return `${symbol}${formatted}`;
}
