import type { Currency } from "@/types";

/** 1 unit of foreign currency = X EUR (EUR reference). */
export type ExchangeRatesToEur = Record<Currency, number>;

export const REFERENCE_CURRENCY: Currency = "EUR";

export const FALLBACK_EXCHANGE_RATES_TO_EUR: ExchangeRatesToEur = {
  EUR: 1,
  USD: 0.92,
  AED: 0.25,
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function amountToEur(amount: number, rateToEur: number): number {
  return roundMoney(amount * rateToEur);
}

export function getRateToEur(
  currency: Currency,
  rates: Partial<ExchangeRatesToEur> = FALLBACK_EXCHANGE_RATES_TO_EUR
): number {
  return rates[currency] ?? FALLBACK_EXCHANGE_RATES_TO_EUR[currency];
}

/** Frankfurter returns 1 EUR = X foreign — invert to 1 foreign = Y EUR. */
export function ratesFromFrankfurter(rates: Record<string, number>): ExchangeRatesToEur {
  return {
    EUR: 1,
    USD: rates.USD ? roundMoney(1 / rates.USD) : FALLBACK_EXCHANGE_RATES_TO_EUR.USD,
    AED: rates.AED ? roundMoney(1 / rates.AED) : FALLBACK_EXCHANGE_RATES_TO_EUR.AED,
  };
}

export function formatRateLabel(currency: Currency, rateToEur: number): string {
  if (currency === "EUR") return "1 EUR = 1 EUR";
  const inverse = rateToEur > 0 ? roundMoney(1 / rateToEur) : 0;
  return `1 ${currency} = ${rateToEur.toFixed(4)} EUR (1 EUR = ${inverse.toFixed(4)} ${currency})`;
}

export function getTicketPurchaseUnitEur(ticket: {
  purchaseUnitPrice: number;
  purchaseCurrency: Currency;
  purchaseUnitPriceEur?: number;
  purchaseExchangeRateToEur?: number;
}): number {
  if (ticket.purchaseUnitPriceEur != null) return ticket.purchaseUnitPriceEur;
  const rate =
    ticket.purchaseExchangeRateToEur ??
    FALLBACK_EXCHANGE_RATES_TO_EUR[ticket.purchaseCurrency];
  return amountToEur(ticket.purchaseUnitPrice, rate);
}

export function getTicketPurchaseFeesEur(ticket: {
  purchaseFees: number;
  purchaseCurrency: Currency;
  purchaseFeesEur?: number;
  purchaseExchangeRateToEur?: number;
}): number {
  if (ticket.purchaseFeesEur != null) return ticket.purchaseFeesEur;
  const rate =
    ticket.purchaseExchangeRateToEur ??
    FALLBACK_EXCHANGE_RATES_TO_EUR[ticket.purchaseCurrency];
  return amountToEur(ticket.purchaseFees, rate);
}

export function getTransactionAmountEur(transaction: {
  negotiatedPrice: number;
  currency: Currency;
  negotiatedPriceEur?: number;
  exchangeRateToEur?: number;
}): number {
  if (transaction.negotiatedPriceEur != null) return transaction.negotiatedPriceEur;
  const rate =
    transaction.exchangeRateToEur ?? FALLBACK_EXCHANGE_RATES_TO_EUR[transaction.currency];
  return amountToEur(transaction.negotiatedPrice, rate);
}
