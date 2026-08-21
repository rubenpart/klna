import { calculateMargin } from "@/lib/margin";
import { hoursUntil } from "@/lib/utils";
import type {
  Client,
  DashboardKPIs,
  Event,
  Supplier,
  Ticket,
  TicketAttachment,
  Transaction,
  UrgentDelivery,
} from "@/types";
import { SEED_DATABASE } from "./index";
import type { SeedEvent } from "./types";

export interface HydratedDatabase {
  events: Event[];
  suppliers: Supplier[];
  clients: Client[];
  tickets: Ticket[];
  transactions: Transaction[];
}

function resolveEventDateTime(seed: SeedEvent): string {
  if (seed.demoOffsetHours != null) {
    return new Date(Date.now() + seed.demoOffsetHours * 60 * 60 * 1000).toISOString();
  }
  return seed.dateTime;
}

function toEvent(seed: SeedEvent): Event {
  const { demoOffsetHours: _, createdAt: __, updatedAt: ___, ...rest } = seed;
  return {
    ...rest,
    city: rest.city ?? undefined,
    imageUrl: rest.imageUrl ?? undefined,
    notes: rest.notes ?? undefined,
    dateTime: resolveEventDateTime(seed),
  };
}

function toSupplier(seed: (typeof SEED_DATABASE.suppliers)[0]): Supplier {
  return {
    id: seed.id,
    name: seed.name,
    alias: seed.alias ?? undefined,
    reliability: seed.reliability,
    contactChannel: seed.contactChannel ?? undefined,
  };
}

function toClient(seed: (typeof SEED_DATABASE.clients)[0]): Client {
  return {
    id: seed.id,
    firstName: seed.firstName,
    lastName: seed.lastName,
    email: seed.email ?? undefined,
    phone: seed.phone ?? undefined,
    acquisitionChannel: seed.acquisitionChannel,
    clientType: seed.clientType,
    creditBalance: seed.creditBalance,
    creditCurrency: seed.creditCurrency,
    seatPreferences: seed.seatPreferences ?? undefined,
  };
}

function toAttachment(seed: (typeof SEED_DATABASE.ticketAttachments)[0]): TicketAttachment {
  return {
    id: seed.id,
    ticketId: seed.ticketId,
    type: seed.type,
    fileName: seed.fileName,
    fileUrl: seed.fileUrl,
  };
}

/** Hydrate les enregistrements plats avec relations pour l'UI */
export function hydrateSeedData(): HydratedDatabase {
  const events = SEED_DATABASE.events.map(toEvent);
  const suppliers = SEED_DATABASE.suppliers.map(toSupplier);
  const clients = SEED_DATABASE.clients.map(toClient);

  const eventMap = new Map(events.map((e) => [e.id, e]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const attachmentsByTicket = SEED_DATABASE.ticketAttachments.reduce<
    Map<string, TicketAttachment[]>
  >((acc, att) => {
    const list = acc.get(att.ticketId) ?? [];
    list.push(toAttachment(att));
    acc.set(att.ticketId, list);
    return acc;
  }, new Map());

  const tickets: Ticket[] = SEED_DATABASE.tickets.map((seed) => ({
    id: seed.id,
    eventId: seed.eventId,
    batchId: seed.batchId ?? undefined,
    supplierId: seed.supplierId ?? undefined,
    section: seed.section ?? undefined,
    category: seed.category ?? undefined,
    row: seed.row ?? undefined,
    seats: seed.seats ?? undefined,
    ticketType: seed.ticketType,
    quantity: seed.quantity,
    purchaseUnitPrice: seed.purchaseUnitPrice,
    purchaseFees: seed.purchaseFees,
    purchaseCurrency: seed.purchaseCurrency,
    purchaseDate: seed.purchaseDate,
    stockStatus: seed.stockStatus,
    transferStatus: seed.transferStatus,
    targetSalePrice: seed.targetSalePrice ?? undefined,
    actualSalePrice: seed.actualSalePrice ?? undefined,
    resaleFees: seed.resaleFees,
    resalePlatform: seed.resalePlatform ?? undefined,
    saleCurrency: seed.saleCurrency,
    notes: seed.notes ?? undefined,
    event: eventMap.get(seed.eventId),
    supplier: seed.supplierId ? supplierMap.get(seed.supplierId) : undefined,
    attachments: attachmentsByTicket.get(seed.id),
  }));

  const ticketMap = new Map(tickets.map((t) => [t.id, t]));

  const transactions: Transaction[] = SEED_DATABASE.transactions.map((seed) => ({
    id: seed.id,
    ticketId: seed.ticketId,
    clientId: seed.clientId,
    saleDate: seed.saleDate,
    negotiatedPrice: seed.negotiatedPrice,
    currency: seed.currency,
    paymentStatus: seed.paymentStatus,
    paymentMethod: seed.paymentMethod ?? undefined,
    deliveryStatus: seed.deliveryStatus,
    resalePlatform: seed.resalePlatform ?? undefined,
    ticket: ticketMap.get(seed.ticketId),
    client: clientMap.get(seed.clientId),
  }));

  for (const client of clients) {
    const clientTxns = transactions.filter(
      (t) => t.clientId === client.id && t.paymentStatus !== "PENDING"
    );
    client.totalSpent = clientTxns.reduce((sum, t) => sum + t.negotiatedPrice, 0);

    client.totalMarginGenerated = clientTxns.reduce((sum, t) => {
      const ticket = ticketMap.get(t.ticketId);
      if (!ticket?.actualSalePrice) return sum;
      const margin = calculateMargin({
        purchaseUnitPrice: ticket.purchaseUnitPrice,
        purchaseFees: ticket.purchaseFees,
        quantity: ticket.quantity,
        purchaseCurrency: ticket.purchaseCurrency,
        saleUnitPrice: ticket.actualSalePrice,
        resaleFees: ticket.resaleFees,
        saleCurrency: ticket.saleCurrency,
      });
      return sum + margin.netMargin;
    }, 0);
  }

  return { events, suppliers, clients, tickets, transactions };
}

export function computeKPIs(tickets: Ticket[], transactions?: Transaction[]): DashboardKPIs {
  const soldTickets = tickets.filter((t) => t.stockStatus === "SOLD" && t.actualSalePrice);

  const totalRevenue = soldTickets.reduce(
    (sum, t) => sum + (t.actualSalePrice ?? 0) * t.quantity,
    0
  );

  const margins = soldTickets.map((t) =>
    calculateMargin({
      purchaseUnitPrice: t.purchaseUnitPrice,
      purchaseFees: t.purchaseFees,
      quantity: t.quantity,
      purchaseCurrency: t.purchaseCurrency,
      saleUnitPrice: t.actualSalePrice ?? 0,
      resaleFees: t.resaleFees,
      saleCurrency: t.saleCurrency,
    })
  );

  const totalGrossMargin = margins.reduce((sum, m) => sum + m.netMargin, 0);
  const averageMarginRate =
    margins.length > 0 ? margins.reduce((sum, m) => sum + m.marginRate, 0) / margins.length : 0;

  const now = new Date();
  const monthlyRevenue = (transactions ?? [])
    .filter((t) => {
      if (t.paymentStatus === "PENDING") return false;
      const d = new Date(t.saleDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.negotiatedPrice, 0);

  const inStock = tickets.filter(
    (t) => t.stockStatus === "IN_STOCK" || t.stockStatus === "RESERVED"
  );

  const stockInvestment = inStock.reduce((sum, t) => {
    const m = calculateMargin({
      purchaseUnitPrice: t.purchaseUnitPrice,
      purchaseFees: t.purchaseFees,
      quantity: t.quantity,
      purchaseCurrency: t.purchaseCurrency,
      saleUnitPrice: 0,
      resaleFees: 0,
      saleCurrency: t.saleCurrency,
    });
    return sum + m.totalPurchaseEur;
  }, 0);

  const stockEstimatedValue = inStock.reduce((sum, t) => {
    const m = calculateMargin({
      purchaseUnitPrice: t.purchaseUnitPrice,
      purchaseFees: t.purchaseFees,
      quantity: t.quantity,
      purchaseCurrency: t.purchaseCurrency,
      saleUnitPrice: t.targetSalePrice ?? 0,
      resaleFees: t.resaleFees,
      saleCurrency: t.saleCurrency,
    });
    return sum + m.totalSaleEur;
  }, 0);

  return {
    totalRevenue,
    monthlyRevenue: monthlyRevenue > 0 ? monthlyRevenue : totalRevenue * 0.35,
    totalGrossMargin,
    averageMarginRate,
    stockInvestment,
    stockEstimatedValue,
    ticketsInStock: inStock.reduce((sum, t) => sum + t.quantity, 0),
    ticketsSold: soldTickets.reduce((sum, t) => sum + t.quantity, 0),
  };
}

export function getUrgentDeliveries(
  transactions: Transaction[],
  tickets: Ticket[],
  events: Event[]
): UrgentDelivery[] {
  const urgent: UrgentDelivery[] = [];
  const ticketMap = new Map(tickets.map((t) => [t.id, t]));
  const eventMap = new Map(events.map((e) => [e.id, e]));

  for (const txn of transactions) {
    if (txn.deliveryStatus === "TRANSFER_COMPLETED") continue;
    const ticket = ticketMap.get(txn.ticketId);
    const event = ticket ? eventMap.get(ticket.eventId) : undefined;
    if (!ticket || !event) continue;

    const hrs = hoursUntil(event.dateTime);
    if (hrs > 48 || hrs < 0) continue;
    if (ticket.stockStatus !== "SOLD") continue;

    urgent.push({
      ticket,
      event,
      transaction: txn,
      hoursUntilEvent: hrs,
      urgencyLevel: hrs <= 24 ? "critical" : "warning",
    });
  }

  return urgent.sort((a, b) => a.hoursUntilEvent - b.hoursUntilEvent);
}

export interface EventWithStats extends Event {
  ticketCount: number;
  inStock: number;
  sold: number;
  totalMargin: number;
}

export function computeEventStats(events: Event[], tickets: Ticket[]): EventWithStats[] {
  return events.map((event) => {
    const eventTickets = tickets.filter((t) => t.eventId === event.id);
    const sold = eventTickets.filter((t) => t.stockStatus === "SOLD");
    const inStock = eventTickets.filter(
      (t) => t.stockStatus === "IN_STOCK" || t.stockStatus === "RESERVED"
    );

    const totalMargin = sold.reduce((sum, t) => {
      if (!t.actualSalePrice) return sum;
      return (
        sum +
        calculateMargin({
          purchaseUnitPrice: t.purchaseUnitPrice,
          purchaseFees: t.purchaseFees,
          quantity: t.quantity,
          purchaseCurrency: t.purchaseCurrency,
          saleUnitPrice: t.actualSalePrice,
          resaleFees: t.resaleFees,
          saleCurrency: t.saleCurrency,
        }).netMargin
      );
    }, 0);

    return {
      ...event,
      ticketCount: eventTickets.reduce((s, t) => s + t.quantity, 0),
      inStock: inStock.reduce((s, t) => s + t.quantity, 0),
      sold: sold.reduce((s, t) => s + t.quantity, 0),
      totalMargin,
    };
  });
}

export function computeTopEvents(
  tickets: Ticket[],
  events: Event[],
  limit = 8
): { name: string; margin: number; revenue: number }[] {
  const eventMap = new Map(events.map((e) => [e.id, e.name]));

  const byEvent = new Map<string, { margin: number; revenue: number }>();

  for (const t of tickets) {
    if (t.stockStatus !== "SOLD" || !t.actualSalePrice) continue;
    const name = eventMap.get(t.eventId) ?? "Inconnu";
    const cur = byEvent.get(t.eventId) ?? { margin: 0, revenue: 0 };
    const revenue = t.actualSalePrice * t.quantity;
    const margin = calculateMargin({
      purchaseUnitPrice: t.purchaseUnitPrice,
      purchaseFees: t.purchaseFees,
      quantity: t.quantity,
      purchaseCurrency: t.purchaseCurrency,
      saleUnitPrice: t.actualSalePrice,
      resaleFees: t.resaleFees,
      saleCurrency: t.saleCurrency,
    }).netMargin;
    byEvent.set(t.eventId, {
      margin: cur.margin + margin,
      revenue: cur.revenue + revenue,
    });
  }

  return [...byEvent.entries()]
    .map(([id, stats]) => ({ name: eventMap.get(id) ?? id, ...stats }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, limit);
}

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export function computeMonthlySales(
  transactions: Transaction[]
): { month: string; revenue: number; margin: number }[] {
  const byMonth = new Map<string, { revenue: number; margin: number }>();

  for (const txn of transactions) {
    if (txn.paymentStatus === "PENDING") continue;
    const d = new Date(txn.saleDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const cur = byMonth.get(key) ?? { revenue: 0, margin: 0 };
    byMonth.set(key, {
      revenue: cur.revenue + txn.negotiatedPrice,
      margin: cur.margin + txn.negotiatedPrice * 0.28,
    });
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([key, stats]) => {
      const month = parseInt(key.split("-")[1], 10);
      return { month: MONTH_LABELS[month], ...stats };
    });
}

export function computeChannelProfitability(
  transactions: Transaction[],
  tickets: Ticket[]
): { channel: string; margin: number; count: number }[] {
  const ticketMap = new Map(tickets.map((t) => [t.id, t]));
  const labels: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    STUBHUB: "StubHub",
    VIAGOGO: "Viagogo",
    DIRECT_CLIENT: "Direct Client",
    PRIVATE_SALE: "Gré à gré",
  };

  const byChannel = new Map<string, { margin: number; count: number }>();

  for (const txn of transactions) {
    if (txn.paymentStatus === "PENDING") continue;
    const platform = txn.resalePlatform ?? "DIRECT_CLIENT";
    const channel = labels[platform] ?? platform;
    const ticket = ticketMap.get(txn.ticketId);
    let margin = txn.negotiatedPrice * 0.25;
    if (ticket?.actualSalePrice) {
      margin = calculateMargin({
        purchaseUnitPrice: ticket.purchaseUnitPrice,
        purchaseFees: ticket.purchaseFees,
        quantity: ticket.quantity,
        purchaseCurrency: ticket.purchaseCurrency,
        saleUnitPrice: ticket.actualSalePrice,
        resaleFees: ticket.resaleFees,
        saleCurrency: ticket.saleCurrency,
      }).netMargin;
    }
    const cur = byChannel.get(channel) ?? { margin: 0, count: 0 };
    byChannel.set(channel, { margin: cur.margin + margin, count: cur.count + 1 });
  }

  return [...byChannel.entries()]
    .map(([channel, stats]) => ({ channel, ...stats }))
    .sort((a, b) => b.margin - a.margin);
}
