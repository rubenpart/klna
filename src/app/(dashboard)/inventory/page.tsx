"use client";

import { InventoryTable } from "@/components/inventory/inventory-table";
import { useCrmStore } from "@/stores/crm-store";

export default function InventoryPage() {
  const tickets = useCrmStore((s) => s.tickets);
  return <InventoryTable tickets={tickets} />;
}
