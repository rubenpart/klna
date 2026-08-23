"use client";

import { useEffect } from "react";
import { enableLiveClock } from "@/lib/demo-time";
import { useCrmStore } from "@/stores/crm-store";

/** After hydration, switch time-sensitive KPIs to the real clock. */
export function LiveClockSync() {
  useEffect(() => {
    enableLiveClock();
    useCrmStore.getState().refreshComputed();
  }, []);

  return null;
}
