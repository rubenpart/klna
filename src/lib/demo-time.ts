/** Fixed reference instant so SSR and client hydration produce identical demo data. */
export const DEMO_REFERENCE_NOW_ISO = "2026-08-23T08:00:00.000Z";

let liveClockEnabled = false;

export function getDemoNow(): Date {
  return new Date(DEMO_REFERENCE_NOW_ISO);
}

/** Stable on server + first client paint; switches to real time after mount. */
export function getAppNow(): Date {
  if (liveClockEnabled && typeof window !== "undefined") {
    return new Date();
  }
  return getDemoNow();
}

export function enableLiveClock() {
  liveClockEnabled = true;
}
