"use client";

import { SellersTable } from "@/components/partners/sellers-table";
import { useCrmStore } from "@/stores/crm-store";

export default function VendeursPage() {
  const sellers = useCrmStore((s) => s.sellers);
  return <SellersTable sellers={sellers} />;
}
