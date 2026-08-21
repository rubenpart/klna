"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import type { Transaction } from "@/types";
import { PAYMENT_STATUS_LABELS, RESALE_PLATFORM_LABELS } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const paymentVariant: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  DEPOSIT: "warning",
  PENDING: "secondary",
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Dernières Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.slice(0, 6).map((txn) => (
            <div
              key={txn.id}
              className="group flex items-center gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/30 sm:gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {txn.client?.firstName?.[0]}
                {txn.client?.lastName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {txn.client?.firstName} {txn.client?.lastName}
                  </p>
                  <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                    {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {txn.ticket?.event?.name} ·{" "}
                  {txn.resalePlatform && RESALE_PLATFORM_LABELS[txn.resalePlatform]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {formatCurrency(txn.negotiatedPrice, txn.currency)}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatDateTime(txn.saleDate)}</p>
              </div>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
