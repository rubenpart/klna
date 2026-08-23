"use client";

import { useMemo } from "react";
import { ClientsTable } from "@/components/clients/clients-table";
import { useCrmStore } from "@/stores/crm-store";

export default function ClientsPage() {
  const clients = useCrmStore((s) => s.clients);
  const transactions = useCrmStore((s) => s.transactions);

  const transactionCountByClient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const txn of transactions) {
      counts[txn.clientId] = (counts[txn.clientId] ?? 0) + 1;
    }
    return counts;
  }, [transactions]);

  return (
    <ClientsTable clients={clients} transactionCountByClient={transactionCountByClient} />
  );
}
