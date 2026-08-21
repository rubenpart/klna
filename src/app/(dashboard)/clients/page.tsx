"use client";

import { ClientsTable } from "@/components/clients/clients-table";
import { useCrmStore } from "@/stores/crm-store";

export default function ClientsPage() {
  const clients = useCrmStore((s) => s.clients);
  const transactions = useCrmStore((s) => s.transactions);

  const transactionCountByClient: Record<string, number> = {};
  for (const txn of transactions) {
    transactionCountByClient[txn.clientId] = (transactionCountByClient[txn.clientId] ?? 0) + 1;
  }

  return (
    <ClientsTable clients={clients} transactionCountByClient={transactionCountByClient} />
  );
}
