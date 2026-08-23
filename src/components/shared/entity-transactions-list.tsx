"use client";

import Link from "next/link";
import { ClipboardList, FileText, MapPin } from "lucide-react";
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
import { SalePriceDisplay } from "@/components/shared/sale-price-display";
import { formatCurrency } from "@/lib/currency";
import { salePlacementLabel } from "@/lib/invoice";
import {
  computeBringerCommission,
  computeTransactionMargin,
} from "@/lib/transaction-stats";
import { formatDate } from "@/lib/utils";
import type { BusinessBringer, Transaction } from "@/types";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/types";
import { useCrmStore } from "@/stores/crm-store";

type EntityTransactionsVariant = "client" | "bringer" | "seller" | "event";

interface EntityTransactionsListProps {
  transactions: Transaction[];
  variant: EntityTransactionsVariant;
  bringer?: BusinessBringer;
  title?: string;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  allowStatusUpdate?: boolean;
}

const paymentVariant: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  DEPOSIT: "warning",
  PENDING: "secondary",
};

const deliveryVariant: Record<string, "critical" | "warning" | "success" | "secondary"> = {
  TO_DELIVER: "critical",
  DELIVERED: "success",
};

export function EntityTransactionsList({
  transactions,
  variant,
  bringer,
  title = "Historique",
  emptyMessage = "Aucune transaction enregistrée.",
  toolbar,
  allowStatusUpdate = false,
}: EntityTransactionsListProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  const showClient = variant !== "client";
  const showEvent = variant === "bringer" || variant === "seller";
  const showMargin = variant === "client" || variant === "event";
  const showPaymentDelivery = variant === "client" || variant === "event";
  const showQuantity = variant === "event";
  const showCommission = variant === "bringer";
  const showActions = allowStatusUpdate && variant === "event";

  const renderActions = (txn: Transaction, className?: string) => {
    if (!showActions) return null;
    return (
      <div className={className ?? "flex flex-wrap gap-1.5"}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-[10px]"
          onClick={() => openDialog("updateSaleStatus", { transactionId: txn.id })}
        >
          <ClipboardList className="h-3 w-3" />
          Statuts
        </Button>
        {txn.seatsPending && !txn.assignedSeats && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px]"
            onClick={() =>
              openDialog("assignSeats", { transactionId: txn.id, assignMode: "sale" })
            }
          >
            <MapPin className="h-3 w-3" />
            Places
          </Button>
        )}
      </div>
    );
  };

  if (sorted.length === 0) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="space-y-3 pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {toolbar}
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {toolbar}
      </CardHeader>
      <CardContent className="space-y-3 p-0 pb-4 sm:p-0 sm:pb-4">
        <div className="space-y-3 px-4 lg:hidden">
          {sorted.map((txn) => (
            <div key={txn.id} className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {variant === "event" && txn.client ? (
                    <Link
                      href={`/clients/${txn.clientId}`}
                      className="truncate text-sm font-medium hover:text-primary"
                    >
                      {txn.client.firstName} {txn.client.lastName}
                    </Link>
                  ) : showEvent ? (
                    <Link
                      href={`/events/${txn.ticket?.eventId}`}
                      className="truncate text-sm font-medium hover:text-primary"
                    >
                      {txn.ticket?.event?.name ?? "Événement"}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-medium">
                      {txn.ticket?.event?.name ?? "Événement"}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">{formatDate(txn.saleDate)}</p>
                </div>
                <SalePriceDisplay transaction={txn} size="sm" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {salePlacementLabel(txn.ticket, txn)}
                {showQuantity && (
                  <> · ×{txn.soldQuantity ?? 1}</>
                )}
              </p>
              {showClient && variant !== "event" && txn.client && (
                <p className="mt-1 text-xs">
                  Client :{" "}
                  <Link href={`/clients/${txn.clientId}`} className="hover:text-primary">
                    {txn.client.firstName} {txn.client.lastName}
                  </Link>
                </p>
              )}
              {showCommission && (
                <p className="mt-1 text-xs text-emerald-600">
                  Commission :{" "}
                  {formatCurrency(computeBringerCommission(txn, bringer), txn.currency)}
                </p>
              )}
              {showMargin && (
                <p className="mt-1 text-xs text-emerald-600">
                  Marge : {formatCurrency(computeTransactionMargin(txn, txn.ticket), "EUR")}
                </p>
              )}
              {txn.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">{txn.notes}</p>
              )}
              {showPaymentDelivery && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                    {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                  </Badge>
                  <Badge variant={deliveryVariant[txn.deliveryStatus]} className="text-[10px]">
                    {DELIVERY_STATUS_LABELS[txn.deliveryStatus]}
                  </Badge>
                </div>
              )}
              {variant === "seller" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                    {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                  </Badge>
                </div>
              )}
              {renderActions(txn, "mt-2 flex flex-wrap gap-1.5")}
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
                  {showClient && <TableHead>Client</TableHead>}
                  {showEvent && <TableHead>Événement</TableHead>}
                  <TableHead>Billet</TableHead>
                  {showQuantity && <TableHead>Qté</TableHead>}
                  {showCommission && <TableHead>Commission</TableHead>}
                  {showMargin && <TableHead>Marge</TableHead>}
                  <TableHead>Montant</TableHead>
                  {showPaymentDelivery && <TableHead>Paiement</TableHead>}
                  {showPaymentDelivery && <TableHead>Livraison</TableHead>}
                  <TableHead>Facture</TableHead>
                  {showActions && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-xs">{formatDate(txn.saleDate)}</TableCell>
                    {showClient && (
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
                    {showEvent && (
                      <TableCell>
                        <Link
                          href={`/events/${txn.ticket?.eventId}`}
                          className="text-sm hover:text-primary"
                        >
                          {txn.ticket?.event?.name ?? "—"}
                        </Link>
                      </TableCell>
                    )}
                    <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                      <p className="truncate">{salePlacementLabel(txn.ticket, txn)}</p>
                      {txn.notes && (
                        <p className="mt-0.5 line-clamp-2 text-[10px] italic">{txn.notes}</p>
                      )}
                    </TableCell>
                    {showQuantity && (
                      <TableCell className="font-mono text-xs tabular-nums">
                        {txn.soldQuantity ?? 1}
                      </TableCell>
                    )}
                    {showCommission && (
                      <TableCell className="font-mono text-xs tabular-nums text-emerald-600">
                        {formatCurrency(computeBringerCommission(txn, bringer), txn.currency)}
                      </TableCell>
                    )}
                    {showMargin && (
                      <TableCell className="font-mono text-xs tabular-nums text-emerald-600">
                        {formatCurrency(computeTransactionMargin(txn, txn.ticket), "EUR")}
                      </TableCell>
                    )}
                    <TableCell>
                      <SalePriceDisplay transaction={txn} />
                    </TableCell>
                    {showPaymentDelivery && (
                      <TableCell>
                        <Badge variant={paymentVariant[txn.paymentStatus]} className="text-[10px]">
                          {PAYMENT_STATUS_LABELS[txn.paymentStatus]}
                        </Badge>
                      </TableCell>
                    )}
                    {showPaymentDelivery && (
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
                    {showActions && (
                      <TableCell>{renderActions(txn)}</TableCell>
                    )}
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
