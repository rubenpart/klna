"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventInventory } from "@/components/events/event-inventory";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import { computeEventStockSummary } from "@/lib/ticket-stock";
import { useCrmStore } from "@/stores/crm-store";
import { EVENT_CATEGORY_LABELS } from "@/types";

const statusVariant: Record<string, "success" | "secondary" | "destructive"> = {
  UPCOMING: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const statusLabel: Record<string, string> = {
  UPCOMING: "À venir",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

interface EventDetailProps {
  eventId: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const eventStats = useCrmStore((s) => s.eventStats);
  const allTickets = useCrmStore((s) => s.tickets);
  const transactions = useCrmStore((s) => s.transactions);

  const event = useMemo(
    () => eventStats.find((e) => e.id === eventId),
    [eventStats, eventId]
  );
  const tickets = useMemo(
    () => allTickets.filter((t) => t.eventId === eventId),
    [allTickets, eventId]
  );
  const stockSummary = useMemo(
    () => computeEventStockSummary(allTickets, transactions, eventId),
    [allTickets, transactions, eventId]
  );

  if (!event) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Événement introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/events">Retour aux événements</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 gap-1.5 text-muted-foreground">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Événements
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">{event.name}</h1>
              <Badge variant={statusVariant[event.status]}>{statusLabel[event.status]}</Badge>
              <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.venue}
              {event.city ? `, ${event.city}` : ""}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatDateTime(event.dateTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">En stock</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">{event.inStock}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendus</p>
              <p className="text-xl font-bold tabular-nums">{event.sold}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total billets</p>
              <p className="flex items-center gap-1 text-xl font-bold tabular-nums">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                {event.ticketCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marge totale</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">
                {event.totalMargin > 0 ? formatCurrency(event.totalMargin, "EUR") : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Investissement</p>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(stockSummary.totalInvest, "EUR")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Valeur estimée</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(stockSummary.totalEst, "EUR")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50 col-span-2 sm:col-span-1">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plus-value potentielle</p>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(stockSummary.potentialGain, "EUR")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventInventory event={event} tickets={tickets} />
    </div>
  );
}
