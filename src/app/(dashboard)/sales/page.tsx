"use client";

import { SalesPipeline } from "@/components/sales/sales-pipeline";
import { useCrmStore } from "@/stores/crm-store";

export default function SalesPage() {
  const transactions = useCrmStore((s) => s.transactions);
  return <SalesPipeline transactions={transactions} />;
}
