import {
  amountToEur,
  FALLBACK_EXCHANGE_RATES_TO_EUR,
  getRateToEur,
} from "@/lib/exchange-rates";
import type { Currency } from "@/types";

export { FALLBACK_EXCHANGE_RATES_TO_EUR as EXCHANGE_RATES_TO_EUR };

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  AED: "AED",
};

export function convertToEur(
  amount: number,
  currency: Currency,
  rateToEur?: number
): number {
  const rate = rateToEur ?? getRateToEur(currency);
  return amountToEur(amount, rate);
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
