"use client";

import { AlertTriangle, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { UrgentDelivery } from "@/types";
import { DELIVERY_STATUS_LABELS } from "@/types";

interface UpcomingDeliveriesProps {
  deliveries: UrgentDelivery[];
}

export function UpcomingDeliveries({ deliveries }: UpcomingDeliveriesProps) {
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
          deliveries.map((d) => (
            <div
              key={d.ticket.id}
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
                    {d.ticket.section} · {d.ticket.seats} ·{" "}
                    {d.transaction?.client
                      ? `${d.transaction.client.firstName} ${d.transaction.client.lastName}`
                      : "Client inconnu"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateTime(d.event.dateTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                <Badge variant="outline" className="text-[10px]">
                  {DELIVERY_STATUS_LABELS[d.transaction?.deliveryStatus ?? "TO_DELIVER"]}
                </Badge>
                <Button size="sm" variant="outline" className="h-10 gap-1.5 text-xs">
                  <Send className="h-3.5 w-3.5" />
                  Transférer
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
