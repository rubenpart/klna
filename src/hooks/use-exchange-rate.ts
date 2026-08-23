"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_EXCHANGE_RATES_TO_EUR,
  getRateToEur,
  type ExchangeRatesToEur,
} from "@/lib/exchange-rates";
import type { Currency } from "@/types";

interface ExchangeRatesResponse {
  rates: ExchangeRatesToEur;
  fetchedAt: string;
  source: "frankfurter" | "fallback";
}

export function useExchangeRate(currency: Currency) {
  const [rate, setRate] = useState(() => getRateToEur(currency));
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [source, setSource] = useState<"frankfurter" | "fallback" | "manual">("fallback");

  const applyRates = useCallback(
    (
      rates: ExchangeRatesToEur,
      meta?: Pick<ExchangeRatesResponse, "fetchedAt" | "source">,
      force = false
    ) => {
      if (manual && !force) return;
      setRate(getRateToEur(currency, rates));
      setFetchedAt(meta?.fetchedAt ?? null);
      setSource(meta?.source ?? "fallback");
    },
    [currency, manual]
  );

  const refresh = useCallback(
    async (force = false) => {
      if (currency === "EUR") {
        setRate(1);
        setFetchedAt(new Date().toISOString());
        setSource("fallback");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/exchange-rates");
        if (!response.ok) throw new Error("Exchange rates unavailable");
        const data = (await response.json()) as ExchangeRatesResponse;
        applyRates(data.rates, { fetchedAt: data.fetchedAt, source: data.source }, force);
      } catch {
        if (!manual || force) {
          setRate(FALLBACK_EXCHANGE_RATES_TO_EUR[currency]);
          setSource("fallback");
        }
      } finally {
        setLoading(false);
      }
    },
    [applyRates, currency, manual]
  );

  useEffect(() => {
    setManual(false);

    if (currency === "EUR") {
      setRate(1);
      setFetchedAt(new Date().toISOString());
      setSource("fallback");
      return;
    }

    void refresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on currency change only
  }, [currency]);

  const setManualRate = useCallback((value: number) => {
    setManual(true);
    setSource("manual");
    setRate(value);
  }, []);

  const resetToLive = useCallback(() => {
    setManual(false);
  }, []);

  return {
    rate,
    manual,
    loading,
    fetchedAt,
    source,
    setManualRate,
    resetToLive,
    refresh,
  };
}
