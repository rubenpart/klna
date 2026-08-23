"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityTransactionsList } from "@/components/shared/entity-transactions-list";
import type { Ticket } from "@/types";
import { DELIVERY_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface EventSoldTicketsProps {
  tickets: Ticket[];
}

export function EventSoldTickets({ tickets }: EventSoldTicketsProps) {
  const transactions = useCrmStore((s) => s.transactions);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState("ALL");

  const soldTransactions = useMemo(() => {
    const ticketIds = new Set(tickets.map((t) => t.id));
    return transactions.filter((txn) => ticketIds.has(txn.ticketId));
  }, [tickets, transactions]);

  const filteredTransactions = useMemo(() => {
    return soldTransactions.filter((txn) => {
      if (paymentFilter !== "ALL" && txn.paymentStatus !== paymentFilter) return false;
      if (deliveryFilter !== "ALL" && txn.deliveryStatus !== deliveryFilter) return false;
      return true;
    });
  }, [soldTransactions, paymentFilter, deliveryFilter]);

  const emptyMessage =
    soldTransactions.length === 0
      ? "Aucun billet vendu pour cet événement."
      : "Aucun billet ne correspond à ces filtres.";

  const filters = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
        <SelectTrigger className="h-9 w-full sm:w-40">
          <SelectValue placeholder="Paiement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous paiements</SelectItem>
          {(Object.keys(PAYMENT_STATUS_LABELS) as Array<keyof typeof PAYMENT_STATUS_LABELS>).map(
            (key) => (
              <SelectItem key={key} value={key}>
                {PAYMENT_STATUS_LABELS[key]}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
        <SelectTrigger className="h-9 w-full sm:w-40">
          <SelectValue placeholder="Livraison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Toutes livraisons</SelectItem>
          {(Object.keys(DELIVERY_STATUS_LABELS) as Array<keyof typeof DELIVERY_STATUS_LABELS>).map(
            (key) => (
              <SelectItem key={key} value={key}>
                {DELIVERY_STATUS_LABELS[key]}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <EntityTransactionsList
      transactions={filteredTransactions}
      variant="event"
      title="Billets vendus"
      emptyMessage={emptyMessage}
      toolbar={filters}
      allowStatusUpdate
    />
  );
}
