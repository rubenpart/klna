import type { Ticket, TicketType, Transaction } from "@/types";
import { calculateMargin } from "@/lib/margin";

export function getTicketSoldQuantity(ticketId: string, transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.ticketId === ticketId)
    .reduce((sum, t) => sum + (t.soldQuantity ?? 1), 0);
}

export function getTicketAvailableQuantity(ticket: Ticket, transactions: Transaction[]): number {
  const sold = getTicketSoldQuantity(ticket.id, transactions);
  return Math.max(0, ticket.quantity - sold);
}

export function isTicketSellable(ticket: Ticket, transactions: Transaction[]): boolean {
  return getTicketAvailableQuantity(ticket, transactions) > 0;
}

export interface TicketTypeStockSummary {
  ticketType: TicketType;
  available: number;
  total: number;
  activeLots: number;
}

export function groupStockByTicketType(
  tickets: Ticket[],
  transactions: Transaction[],
  eventId?: string
): TicketTypeStockSummary[] {
  const filtered = eventId ? tickets.filter((t) => t.eventId === eventId) : tickets;
  const byType = new Map<TicketType, TicketTypeStockSummary>();

  for (const ticket of filtered) {
    const available = getTicketAvailableQuantity(ticket, transactions);
    const cur = byType.get(ticket.ticketType) ?? {
      ticketType: ticket.ticketType,
      available: 0,
      total: 0,
      activeLots: 0,
    };

    byType.set(ticket.ticketType, {
      ticketType: ticket.ticketType,
      available: cur.available + available,
      total: cur.total + ticket.quantity,
      activeLots: cur.activeLots + (available > 0 ? 1 : 0),
    });
  }

  return [...byType.values()].sort((a, b) => b.available - a.available);
}

export interface CategoryStockSummary {
  key: string;
  section: string;
  category: string;
  label: string;
  available: number;
  total: number;
  placementCount: number;
  minPrice?: number;
  maxPrice?: number;
}

export function getCategoryGroupKey(ticket: Ticket): { key: string; section: string; category: string; label: string } {
  const section = ticket.section?.trim() || "Sans section";
  const category = ticket.category?.trim() || "Sans catégorie";
  return {
    section,
    category,
    key: `${section}::${category}`,
    label: `${section} — ${category}`,
  };
}

export interface EventCategoryOption {
  key: string;
  section: string;
  category: string;
  label: string;
}

export function getEventCategoryOptions(tickets: Ticket[], eventId: string): EventCategoryOption[] {
  const seen = new Map<string, EventCategoryOption>();

  for (const ticket of tickets) {
    if (ticket.eventId !== eventId) continue;

    const { key, label } = getCategoryGroupKey(ticket);
    if (seen.has(key)) continue;

    seen.set(key, {
      key,
      section: ticket.section?.trim() ?? "",
      category: ticket.category?.trim() ?? "",
      label,
    });
  }

  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

export function groupStockByCategory(
  tickets: Ticket[],
  transactions: Transaction[],
  eventId?: string
): CategoryStockSummary[] {
  const filtered = eventId ? tickets.filter((t) => t.eventId === eventId) : tickets;
  const byCategory = new Map<string, CategoryStockSummary>();

  for (const ticket of filtered) {
    const group = getCategoryGroupKey(ticket);
    const available = getTicketAvailableQuantity(ticket, transactions);
    const cur = byCategory.get(group.key) ?? {
      key: group.key,
      section: group.section,
      category: group.category,
      label: group.label,
      available: 0,
      total: 0,
      placementCount: 0,
      minPrice: undefined,
      maxPrice: undefined,
    };

    const price = ticket.targetSalePrice ?? undefined;

    byCategory.set(group.key, {
      ...cur,
      available: cur.available + available,
      total: cur.total + ticket.quantity,
      placementCount: cur.placementCount + (available > 0 ? 1 : 0),
      minPrice:
        price != null
          ? cur.minPrice != null
            ? Math.min(cur.minPrice, price)
            : price
          : cur.minPrice,
      maxPrice:
        price != null
          ? cur.maxPrice != null
            ? Math.max(cur.maxPrice, price)
            : price
          : cur.maxPrice,
    });
  }

  return [...byCategory.values()]
    .filter((c) => c.available > 0)
    .sort((a, b) => b.available - a.available);
}

export function parseSeatRange(seats?: string | null): string[] {
  if (!seats?.trim()) return [];
  const trimmed = seats.trim();
  if (trimmed.includes("-")) {
    const [startRaw, endRaw] = trimmed.split("-");
    const start = parseInt(startRaw.trim(), 10);
    const end = parseInt(endRaw.trim(), 10);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
    }
  }
  return [trimmed];
}

export interface SeatPlacement {
  ticketId: string;
  seatLabel: string;
  section?: string;
  row?: string;
  category?: string;
  ticketType: TicketType;
  targetSalePrice?: number;
  minimumSalePrice?: number;
  saleCurrency: Ticket["saleCurrency"];
  lotAvailable: number;
  isPendingLot?: boolean;
}

export function getAssignedSeatLabels(ticketId: string, transactions: Transaction[]): Set<string> {
  const assigned = new Set<string>();
  for (const txn of transactions) {
    if (txn.ticketId !== ticketId || !txn.assignedSeats) continue;
    for (const label of parseSeatRange(txn.assignedSeats)) {
      assigned.add(label);
    }
  }
  return assigned;
}

export function getUnassignedSoldQuantity(ticketId: string, transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.ticketId === ticketId && t.seatsPending && !t.assignedSeats)
    .reduce((sum, t) => sum + (t.soldQuantity ?? 1), 0);
}

export function getSeatPlacementsForCategory(
  tickets: Ticket[],
  transactions: Transaction[],
  eventId: string,
  categoryKey: string
): SeatPlacement[] {
  const normalizedKey = categoryKey.trim();
  const placements: SeatPlacement[] = [];

  for (const ticket of tickets) {
    if (ticket.eventId !== eventId) continue;
    const group = getCategoryGroupKey(ticket);
    if (group.key !== normalizedKey) continue;

    const lotAvailable = getTicketAvailableQuantity(ticket, transactions);
    if (lotAvailable <= 0) continue;

    if (ticket.seatsPending) {
      placements.push({
        ticketId: ticket.id,
        seatLabel: `Lot ×${lotAvailable}`,
        section: ticket.section ?? undefined,
        row: ticket.row ?? undefined,
        category: ticket.category ?? undefined,
        ticketType: ticket.ticketType,
        targetSalePrice: ticket.targetSalePrice,
        minimumSalePrice: ticket.minimumSalePrice,
        saleCurrency: ticket.saleCurrency,
        lotAvailable,
        isPendingLot: true,
      });
      continue;
    }

    const seatLabels = parseSeatRange(ticket.seats);
    if (seatLabels.length === 0) {
      placements.push({
        ticketId: ticket.id,
        seatLabel: `Lot ×${lotAvailable}`,
        section: ticket.section ?? undefined,
        row: ticket.row ?? undefined,
        category: ticket.category ?? undefined,
        ticketType: ticket.ticketType,
        targetSalePrice: ticket.targetSalePrice,
        minimumSalePrice: ticket.minimumSalePrice,
        saleCurrency: ticket.saleCurrency,
        lotAvailable,
      });
      continue;
    }

    const assignedSeats = getAssignedSeatLabels(ticket.id, transactions);
    const unassignedSold = getUnassignedSoldQuantity(ticket.id, transactions);
    let unassignedPool = unassignedSold;

    for (const seatLabel of seatLabels) {
      if (assignedSeats.has(seatLabel)) continue;

      if (unassignedPool > 0) {
        unassignedPool -= 1;
        continue;
      }

      placements.push({
        ticketId: ticket.id,
        seatLabel,
        section: ticket.section ?? undefined,
        row: ticket.row ?? undefined,
        category: ticket.category ?? undefined,
        ticketType: ticket.ticketType,
        targetSalePrice: ticket.targetSalePrice,
        minimumSalePrice: ticket.minimumSalePrice,
        saleCurrency: ticket.saleCurrency,
        lotAvailable,
      });
    }
  }

  return placements.sort((a, b) => {
    const section = (a.section ?? "").localeCompare(b.section ?? "");
    if (section !== 0) return section;
    const row = (a.row ?? "").localeCompare(b.row ?? "", undefined, { numeric: true });
    if (row !== 0) return row;
    return a.seatLabel.localeCompare(b.seatLabel, undefined, { numeric: true });
  });
}

export function computeEventStockSummary(
  tickets: Ticket[],
  transactions: Transaction[],
  eventId: string
) {
  const eventTickets = tickets.filter((t) => t.eventId === eventId);
  const stockByCategory = groupStockByCategory(eventTickets, transactions, eventId);

  let totalInvest = 0;
  let totalEst = 0;
  let marginSum = 0;
  let marginCount = 0;

  for (const ticket of eventTickets) {
    const available = getTicketAvailableQuantity(ticket, transactions);
    if (available <= 0) continue;

    const margin = calculateMargin({
      purchaseUnitPrice: ticket.purchaseUnitPrice,
      purchaseFees: ticket.purchaseFees * (available / ticket.quantity),
      quantity: available,
      purchaseCurrency: ticket.purchaseCurrency,
      saleUnitPrice: ticket.targetSalePrice ?? 0,
      resaleFees: 0,
      saleCurrency: ticket.saleCurrency,
    });

    totalInvest += margin.totalPurchaseEur;
    totalEst += margin.totalSaleEur;
    marginSum += margin.marginRate;
    marginCount += 1;
  }

  return {
    categoryCount: stockByCategory.length,
    totalInvest,
    totalEst,
    potentialGain: totalEst - totalInvest,
    avgMargin: marginCount > 0 ? marginSum / marginCount : 0,
  };
}

/** Limite la sélection de places au stock restant d'un lot */
export function clampSeatSelection(
  selected: SeatPlacement[],
  transactions: Transaction[],
  tickets: Ticket[]
): SeatPlacement[] {
  const byTicket = new Map<string, number>();
  const result: SeatPlacement[] = [];

  for (const seat of selected) {
    const ticket = tickets.find((t) => t.id === seat.ticketId);
    if (!ticket) continue;
    const max = getTicketAvailableQuantity(ticket, transactions);
    const used = byTicket.get(seat.ticketId) ?? 0;
    if (used >= max) continue;
    byTicket.set(seat.ticketId, used + 1);
    result.push(seat);
  }

  return result;
}

export function summarizeSeatSelection(
  selected: SeatPlacement[],
  tickets: Ticket[]
): { ticketId: string; soldQuantity: number } | null {
  if (selected.length === 0) return null;

  const ticketIds = new Set(selected.map((s) => s.ticketId));
  if (ticketIds.size > 1) {
    const firstId = selected[0].ticketId;
    const qty = selected.filter((s) => s.ticketId === firstId).length;
    return { ticketId: firstId, soldQuantity: qty };
  }

  return {
    ticketId: selected[0].ticketId,
    soldQuantity: selected.length,
  };
}
