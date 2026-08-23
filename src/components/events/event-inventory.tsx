"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { CategorySeatsDialog } from "@/components/events/category-seats-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { computeEventStockSummary, groupStockByCategory } from "@/lib/ticket-stock";
import type { Event, Ticket } from "@/types";
import { useCrmStore } from "@/stores/crm-store";
import { PageHeader } from "@/components/layout/page-header";

interface EventInventoryProps {
  event: Event;
  tickets: Ticket[];
}

export function EventInventory({ event, tickets }: EventInventoryProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const transactions = useCrmStore((s) => s.transactions);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const stockByCategory = useMemo(
    () => groupStockByCategory(tickets, transactions, event.id),
    [tickets, transactions, event.id]
  );

  const summary = useMemo(
    () => computeEventStockSummary(tickets, transactions, event.id),
    [tickets, transactions, event.id]
  );

  const openCategory = (key: string, label: string) => {
    setSelectedCategoryKey(key);
    setSelectedCategoryLabel(label);
    setCategoryDialogOpen(true);
  };

  const handleSellFromCategory = (ticketId: string, soldQuantity: number) => {
    openDialog("sale", { ticketId, soldQuantity, eventId: event.id });
  };

  const canAddTicket = event.status === "UPCOMING";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stock disponible"
        description={`${summary.categoryCount} catégorie${summary.categoryCount > 1 ? "s" : ""} · Marge moyenne ${summary.avgMargin.toFixed(1)}%`}
        actions={
          canAddTicket ? (
            <Button
              size="sm"
              className="h-10 gap-1.5"
              onClick={() => openDialog("ticket", { eventId: event.id })}
            >
              <Plus className="h-4 w-4" />
              Billet
            </Button>
          ) : undefined
        }
      />

      {stockByCategory.length === 0 ? (
        <Card className="border-border/60 bg-card/50">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucune catégorie avec du stock disponible pour cet événement.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {stockByCategory.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => openCategory(group.key, group.label)}
              className="group rounded-xl border border-border/60 bg-card/50 p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight">{group.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cliquez pour voir les places disponibles
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold tabular-nums text-emerald-600">{group.available}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    places disponibles
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {group.placementCount} lot{group.placementCount > 1 ? "s" : ""}
                  {group.minPrice != null && (
                    <p className="mt-1 text-sm font-medium text-foreground">
                      dès {formatCurrency(group.minPrice, "EUR")}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <CategorySeatsDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        event={event}
        categoryKey={selectedCategoryKey}
        categoryLabel={selectedCategoryLabel}
        tickets={tickets}
        transactions={transactions}
        onSell={handleSellFromCategory}
      />
    </div>
  );
}
