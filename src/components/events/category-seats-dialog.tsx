"use client";

import { useMemo, useState } from "react";
import { MapPin, Minus, Plus, ShoppingCart, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import {
  clampSeatSelection,
  getSeatPlacementsForCategory,
  type SeatPlacement,
} from "@/lib/ticket-stock";
import { cn } from "@/lib/utils";
import type { Event, Ticket as TicketModel, Transaction } from "@/types";
import { TICKET_TYPE_LABELS } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface CategorySeatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  categoryKey: string | null;
  categoryLabel: string | null;
  tickets: TicketModel[];
  transactions: Transaction[];
  onSell: (ticketId: string, soldQuantity: number) => void;
}

function seatKey(seat: SeatPlacement) {
  return `${seat.ticketId}:${seat.seatLabel}`;
}

export function CategorySeatsDialog({
  open,
  onOpenChange,
  event,
  categoryKey,
  categoryLabel,
  tickets,
  transactions,
  onSell,
}: CategorySeatsDialogProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [selected, setSelected] = useState<SeatPlacement[]>([]);
  const [pendingQty, setPendingQty] = useState<Record<string, number>>({});

  const placements = useMemo(() => {
    if (!categoryKey) return [];
    return getSeatPlacementsForCategory(tickets, transactions, event.id, categoryKey);
  }, [categoryKey, event.id, tickets, transactions]);

  const pendingLots = useMemo(
    () => placements.filter((p) => p.isPendingLot),
    [placements]
  );
  const seatPlacements = useMemo(
    () => placements.filter((p) => !p.isPendingLot),
    [placements]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SeatPlacement[]>();
    for (const p of seatPlacements) {
      const key = `${p.section ?? "—"}|${p.row ?? "—"}`;
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [seatPlacements]);

  const toggleSeat = (seat: SeatPlacement) => {
    setSelected((prev) => {
      const key = seatKey(seat);
      const exists = prev.some((s) => seatKey(s) === key);
      if (exists) {
        return prev.filter((s) => seatKey(s) !== key);
      }

      const sameLot = prev.length === 0 || prev.every((s) => s.ticketId === seat.ticketId);
      const next = sameLot ? [...prev, seat] : [seat];
      return clampSeatSelection(next, transactions, tickets);
    });
  };

  const getPendingQuantity = (lot: SeatPlacement) =>
    pendingQty[lot.ticketId] ?? 1;

  const setPendingQuantity = (ticketId: string, qty: number, max: number) => {
    setPendingQty((prev) => ({
      ...prev,
      [ticketId]: Math.max(1, Math.min(qty, max)),
    }));
  };

  const handleSellPending = (lot: SeatPlacement) => {
    const qty = getPendingQuantity(lot);
    onSell(lot.ticketId, qty);
    setPendingQty((prev) => {
      const next = { ...prev };
      delete next[lot.ticketId];
      return next;
    });
    onOpenChange(false);
  };

  const handleSell = () => {
    if (selected.length === 0) return;
    const ticketId = selected[0].ticketId;
    const soldQuantity = selected.filter((s) => s.ticketId === ticketId).length;
    onSell(ticketId, soldQuantity);
    setSelected([]);
    onOpenChange(false);
  };

  const estimatedTotal = selected.reduce(
    (sum, s) => sum + (s.targetSalePrice ?? 0),
    0
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelected([]);
          setPendingQty({});
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {categoryLabel ?? "Places disponibles"}
          </DialogTitle>
          <DialogDescription>
            {event.name}
            {pendingLots.length > 0
              ? " — vendez sans places exactes ou attribuez-les plus tard"
              : " — sélectionnez les places exactes à vendre"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {pendingLots.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lots sans places attribuées
              </p>
              {pendingLots.map((lot) => {
                const qty = getPendingQuantity(lot);
                return (
                  <div
                    key={lot.ticketId}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">Lot ×{lot.lotAvailable}</p>
                          <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-700">
                            Places à confirmer
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {TICKET_TYPE_LABELS[lot.ticketType]}
                          </Badge>
                        </div>
                        {lot.targetSalePrice != null && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cible : {formatCurrency(lot.targetSalePrice, lot.saleCurrency)} / billet
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() =>
                          openDialog("assignSeats", {
                            ticketId: lot.ticketId,
                            assignMode: "ticket",
                          })
                        }
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Attribuer
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Quantité</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPendingQuantity(lot.ticketId, qty - 1, lot.lotAvailable)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={lot.lotAvailable}
                          value={qty}
                          onChange={(e) =>
                            setPendingQuantity(
                              lot.ticketId,
                              Number(e.target.value) || 1,
                              lot.lotAvailable
                            )
                          }
                          className="h-8 w-16 text-center tabular-nums"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPendingQuantity(lot.ticketId, qty + 1, lot.lotAvailable)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleSellPending(lot)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Vendre {qty} billet{qty > 1 ? "s" : ""}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {grouped.length === 0 && pendingLots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune place disponible dans cette catégorie.
            </p>
          ) : (
            grouped.map(([groupKey, seats]) => {
              const [section, row] = groupKey.split("|");
              return (
                <div key={groupKey} className="rounded-xl border border-border/60 bg-muted/10 p-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {section !== "—" ? section : "Section non renseignée"}
                    </p>
                    {row !== "—" && (
                      <Badge variant="outline" className="text-[10px]">
                        Rang {row}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {TICKET_TYPE_LABELS[seats[0].ticketType]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seats.map((seat) => {
                      const isSelected = selected.some((s) => seatKey(s) === seatKey(seat));
                      return (
                        <button
                          key={seatKey(seat)}
                          type="button"
                          onClick={() => toggleSeat(seat)}
                          className={cn(
                            "min-w-[3.5rem] rounded-lg border px-3 py-2 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary"
                              : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          <p className="text-sm font-semibold tabular-nums">{seat.seatLabel}</p>
                          {seat.targetSalePrice != null && (
                            <p className="text-[10px] text-muted-foreground">
                              {formatCurrency(seat.targetSalePrice, seat.saleCurrency)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {seatPlacements.length > 0 && (
          <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-medium">
                {selected.length} place{selected.length > 1 ? "s" : ""} sélectionnée{selected.length > 1 ? "s" : ""}
              </p>
              {selected.length > 0 && estimatedTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Estimation : {formatCurrency(estimatedTotal, selected[0].saleCurrency)}
                </p>
              )}
            </div>
            <Button
              className="gap-1.5"
              disabled={selected.length === 0}
              onClick={handleSell}
            >
              <ShoppingCart className="h-4 w-4" />
              Vendre la sélection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
