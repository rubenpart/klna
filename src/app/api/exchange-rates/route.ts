import { NextResponse } from "next/server";
import {
  FALLBACK_EXCHANGE_RATES_TO_EUR,
  ratesFromFrankfurter,
  type ExchangeRatesToEur,
} from "@/lib/exchange-rates";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached:
  | {
      rates: ExchangeRatesToEur;
      fetchedAt: string;
      source: "frankfurter" | "fallback";
      expiresAt: number;
    }
  | undefined;

async function fetchLiveRates(): Promise<{
  rates: ExchangeRatesToEur;
  fetchedAt: string;
  source: "frankfurter" | "fallback";
}> {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD,AED", {
      next: { revalidate: 300 },
    });

    if (!response.ok) throw new Error(`Frankfurter HTTP ${response.status}`);

    const data = (await response.json()) as { date?: string; rates?: Record<string, number> };
    if (!data.rates) throw new Error("Invalid Frankfurter payload");

    return {
      rates: ratesFromFrankfurter(data.rates),
      fetchedAt: new Date().toISOString(),
      source: "frankfurter",
    };
  } catch {
    return {
      rates: FALLBACK_EXCHANGE_RATES_TO_EUR,
      fetchedAt: new Date().toISOString(),
      source: "fallback",
    };
  }
}

export async function GET() {
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return NextResponse.json({
      rates: cached.rates,
      fetchedAt: cached.fetchedAt,
      source: cached.source,
      referenceCurrency: "EUR",
    });
  }

  const live = await fetchLiveRates();
  cached = {
    ...live,
    expiresAt: now + CACHE_TTL_MS,
  };

  return NextResponse.json({
    rates: live.rates,
    fetchedAt: live.fetchedAt,
    source: live.source,
    referenceCurrency: "EUR",
  });
}
