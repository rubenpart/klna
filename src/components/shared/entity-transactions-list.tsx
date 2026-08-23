"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableScroll } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/currency";
import { salePlacementLabel } from "@/lib/invoice";
import {
  computeBringerCommission,
  computeTransactionMargin,
} from "@/lib/transaction-stats";
import { formatDateTime } from "@/lib/utils";
import type { BusinessBringer, Transaction } from "@/types";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/types";
import { useCrmStore } from "@/stores/crm-store";

type EntityTransactionsVariant = "client" | "bringer" | "seller";

interface EntityTransactionsListProps {
  transactions: Transaction[];
  variant: EntityTransactionsVariant;
  bringer?: BusinessBringer;
  title?: string;
  emptyMessage?: string;
}

const paymentVariant: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  DEPOSIT: "warning",
  PENDING: "secondary",
};

const deliveryVariant: Record<string, "critical" | "warning" | "success" | "secondary"> = {
  TO_DELIVER: "critical",
  DELIVERED: "warning",
  TRANSFER_COMPLETED: "success",
};

export function EntityTransactionsList({
  transactions,
  variant,
  bringer,
  title = "Historique",
  emptyMessage = "Aucune transaction enregistrée.",
}: EntityTransactionsListProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0 pb-4 sm:p-0 sm:pb-4">
        <div className="space-y-3 px-4 lg:hidden">
          {sorted.map((txn) => (
            <div key={txn.id} className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/events/${txn.ticket?.eventId}`}
                    className="truncate text-sm font-medium hover:text-primary"
                  >
                    {txn.ticket?.event?.name ?? "Événement"}
                  </Link>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(txn.saleDate)}</p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(txn.negotiatedPrice, txn.currency)}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {salePlacementLabel(txn.ticket, txn)}
              </p>
              {variant !== "client" && txn.client && (
                <p className="mt-1 text-xs">
                  Client :{" "}
                  <Link href={`/clients/${txn.clientId}`} className="hover:text-primary">
                    {txn.client.firstName} {txn.client.lastName}
                  </Link>
                </p>
              )}
              {variant === "bringer" && (
                <p className="mt-1 text-xs text-emerald-600">
                  Commission :{" "}
                  {formatCurrency(computeBringerCommission(txn, bringer), txn.currency)}
                </p>
              )}
              {variant === "client" && (
                <p className="mt-1 text-xs text-emerald-600">
                  Marge : {formatCurrency(computeTransactionMargin(txn, txn.ticket), "EUR")}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                  {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                </Badge>
                {variant === "client" && (
                  <Badge variant={deliveryVariant[txn.deliveryStatus]} className="text-[10px]">
                    {DELIVERY_STATUS_LABELS[txn.deliveryStatus]}
                  </Badge>
                )}
              </div>
              {txn.invoice && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-8 w-full gap-1.5 text-xs"
                  onClick={() => openDialog("invoice", { transactionId: txn.id })}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {txn.invoice.number}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <TableScroll>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  {variant !== "client" && <TableHead>Client</TableHead>}
                  <TableHead>Événement</TableHead>
                  <TableHead>Billet</TableHead>
                  {variant === "bringer" && <TableHead>Commission</TableHead>}
                  {variant === "client" && <TableHead>Marge</TableHead>}
                  <TableHead>Montant</TableHead>
                  {variant === "client" && <TableHead>Paiement</TableHead>}
                  {variant === "client" && <TableHead>Livraison</TableHead>}
                  <TableHead>Facture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-xs">{formatDateTime(txn.saleDate)}</TableCell>
                    {variant !== "client" && (
                      <TableCell>
                        {txn.client ? (
                          <Link
                            href={`/clients/${txn.clientId}`}
                            className="text-sm hover:text-primary"
                          >
                            {txn.client.firstName} {txn.client.lastName}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Link
                        href={`/events/${txn.ticket?.eventId}`}
                        className="text-sm hover:text-primary"
                      >
                        {txn.ticket?.event?.name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {salePlacementLabel(txn.ticket, txn)}
                    </TableCell>
                    {variant === "bringer" && (
                      <TableCell className="font-mono text-xs tabular-nums text-emerald-600">
                        {formatCurrency(computeBringerCommission(txn, bringer), txn.currency)}
                      </TableCell>
                    )}
                    {variant === "client" && (
                      <TableCell className="font-mono text-xs tabular-nums text-emerald-600">
                        {formatCurrency(computeTransactionMargin(txn, txn.ticket), "EUR")}
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(txn.negotiatedPrice, txn.currency)}
                    </TableCell>
                    {variant === "client" && (
                      <TableCell>
                        <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                          {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                        </Badge>
                      </TableCell>
                    )}
                    {variant === "client" && (
                      <TableCell>
                        <Badge variant={deliveryVariant[txn.deliveryStatus]} className="text-[10px]">
                          {DELIVERY_STATUS_LABELS[txn.deliveryStatus]}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {txn.invoice ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-xs"
                          onClick={() => openDialog("invoice", { transactionId: txn.id })}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {txn.invoice.number}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableScroll>
        </div>
      </CardContent>
    </Card>
  );
}
