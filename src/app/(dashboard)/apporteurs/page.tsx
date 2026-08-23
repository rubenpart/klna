"use client";

import { BusinessBringersTable } from "@/components/partners/business-bringers-table";
import { useCrmStore } from "@/stores/crm-store";

export default function ApporteursPage() {
  const businessBringers = useCrmStore((s) => s.businessBringers);
  return <BusinessBringersTable businessBringers={businessBringers} />;
}
