"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salePlacementLabel } from "@/lib/invoice";
import { formatDateTime } from "@/lib/utils";
import { useCrmStore } from "@/stores/crm-store";
import type { DeliveryStatus, UrgentDelivery } from "@/types";
import { DELIVERY_STATUS_LABELS } from "@/types";

interface UpcomingDeliveriesProps {
  deliveries: UrgentDelivery[];
}

export function UpcomingDeliveries({ deliveries }: UpcomingDeliveriesProps) {
  const updateTransactionStatus = useCrmStore((s) => s.updateTransactionStatus);

  const handleDeliveryChange = (delivery: UrgentDelivery, deliveryStatus: DeliveryStatus) => {
    const txn = delivery.transaction;
    if (!txn) return;

    updateTransactionStatus(txn.id, {
      paymentStatus: txn.paymentStatus,
      paymentMethod: txn.paymentMethod,
      deliveryStatus,
      notes: txn.notes ?? "",
    });
  };

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="truncate">Livraisons Urgentes</span>
            <Badge variant="critical">{deliveries.length}</Badge>
          </CardTitle>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            H-24 / H-48
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deliveries.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucune livraison urgente
          </p>
        ) : (
          deliveries.map((d) => {
            const status = d.transaction?.deliveryStatus ?? "TO_DELIVER";
            return (
              <div
                key={d.transaction?.id ?? d.ticket.id}
                className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center ${
                  d.urgencyLevel === "critical"
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      d.urgencyLevel === "critical" ? "bg-red-500/20" : "bg-amber-500/20"
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${
                        d.urgencyLevel === "critical" ? "animate-pulse text-red-600" : "text-amber-600"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{d.event.name}</p>
                      <Badge variant={d.urgencyLevel === "critical" ? "critical" : "warning"}>
                        H-{Math.ceil(d.hoursUntilEvent)}h
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {salePlacementLabel(d.ticket, d.transaction)} ·{" "}
                      {d.transaction?.client
                        ? `${d.transaction.client.firstName} ${d.transaction.client.lastName}`
                        : "Client inconnu"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDateTime(d.event.dateTime)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:w-36">
                  <Select
                    value={status}
                    onValueChange={(v) => handleDeliveryChange(d, v as DeliveryStatus)}
                    disabled={!d.transaction}
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DELIVERY_STATUS_LABELS) as DeliveryStatus[]).map((key) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {DELIVERY_STATUS_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
