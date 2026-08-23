import { create } from "zustand";
import {
  computeChannelProfitability,
  computeEventStats,
  computeKPIs,
  computeMonthlySales,
  computeTopEvents,
  getUrgentDeliveries,
  hydrateSeedData,
} from "@/data/seed/hydrate";
import type { EventWithStats } from "@/data/seed/hydrate";
import type {
  BusinessBringer,
  Client,
  Event,
  Seller,
  Supplier,
  Ticket,
  Transaction,
} from "@/types";
import type {
  BusinessBringerFormValues,
  AssignSeatsFormValues,
  ClientFormValues,
  EventFormValues,
  InvoiceFormValues,
  SaleFormValues,
  SellerFormValues,
  TicketFormValues,
} from "@/lib/validations/crm";
import { invoiceFormToInvoice, ticketDescription } from "@/lib/invoice";
import {
  getTicketAvailableQuantity,
  getTicketSoldQuantity,
} from "@/lib/ticket-stock";

export type FormDialogType =
  | "event"
  | "client"
  | "ticket"
  | "sale"
  | "invoice"
  | "editInvoice"
  | "assignSeats"
  | "businessBringer"
  | "seller"
  | null;

interface CrmState {
  events: Event[];
  suppliers: Supplier[];
  clients: Client[];
  businessBringers: BusinessBringer[];
  sellers: Seller[];
  tickets: Ticket[];
  transactions: Transaction[];
  activeDialog: FormDialogType;
  dialogContext: {
    eventId?: string;
    ticketId?: string;
    transactionId?: string;
    soldQuantity?: number;
    assignMode?: "ticket" | "sale";
  };

  eventStats: EventWithStats[];
  kpis: ReturnType<typeof computeKPIs>;
  topEvents: ReturnType<typeof computeTopEvents>;
  monthlySales: ReturnType<typeof computeMonthlySales>;
  channelProfitability: ReturnType<typeof computeChannelProfitability>;
  urgentDeliveries: ReturnType<typeof getUrgentDeliveries>;

  openDialog: (
    type: FormDialogType,
    context?: {
      eventId?: string;
      ticketId?: string;
      transactionId?: string;
      soldQuantity?: number;
      assignMode?: "ticket" | "sale";
    }
  ) => void;
  closeDialog: () => void;

  addEvent: (data: EventFormValues) => Event;
  addClient: (data: ClientFormValues) => Client;
  addBusinessBringer: (data: BusinessBringerFormValues) => BusinessBringer;
  addSeller: (data: SellerFormValues) => Seller;
  addTicket: (data: TicketFormValues) => Ticket;
  addSale: (data: SaleFormValues) => Transaction;
  assignTicketSeats: (ticketId: string, data: AssignSeatsFormValues) => void;
  assignSaleSeats: (transactionId: string, data: AssignSeatsFormValues) => void;
  updateTransactionInvoice: (transactionId: string, data: InvoiceFormValues) => void;
  refreshComputed: () => void;
}

function generateId(prefix: string): string {
  return `klna_${prefix}_${Date.now().toString(36)}`;
}

function rehydrateRelations(
  state: Pick<
    CrmState,
    "events" | "suppliers" | "clients" | "businessBringers" | "sellers" | "tickets" | "transactions"
  >
) {
  const eventMap = new Map(state.events.map((e) => [e.id, e]));
  const supplierMap = new Map(state.suppliers.map((s) => [s.id, s]));
  const bringerMap = new Map(state.businessBringers.map((b) => [b.id, b]));
  const sellerMap = new Map(state.sellers.map((s) => [s.id, s]));

  const tickets = state.tickets.map((t) => ({
    ...t,
    event: eventMap.get(t.eventId),
    supplier: t.supplierId ? supplierMap.get(t.supplierId) : undefined,
  }));

  const ticketMap = new Map(tickets.map((t) => [t.id, t]));

  const transactions = state.transactions.map((txn) => ({
    ...txn,
    ticket: ticketMap.get(txn.ticketId),
    client: state.clients.find((c) => c.id === txn.clientId),
    businessBringer: txn.businessBringerId
      ? bringerMap.get(txn.businessBringerId)
      : undefined,
    seller: txn.sellerId ? sellerMap.get(txn.sellerId) : undefined,
  }));

  const clients = state.clients.map((c) => {
    const clientTxns = transactions.filter(
      (t) => t.clientId === c.id && t.paymentStatus !== "PENDING"
    );
    return { ...c, totalSpent: clientTxns.reduce((s, t) => s + t.negotiatedPrice, 0) };
  });

  const businessBringers = state.businessBringers.map((b) => {
    const txns = transactions.filter(
      (t) => t.businessBringerId === b.id && t.paymentStatus !== "PENDING"
    );
    const totalCommission = txns.reduce((s, t) => {
      const rate = t.businessBringerCommissionRate ?? b.commissionRate;
      return s + t.negotiatedPrice * (rate / 100);
    }, 0);
    return {
      ...b,
      referralCount: txns.length,
      totalReferredRevenue: txns.reduce((s, t) => s + t.negotiatedPrice, 0),
      totalCommissionEarned: totalCommission,
    };
  });

  const sellers = state.sellers.map((s) => {
    const txns = transactions.filter(
      (t) => t.sellerId === s.id && t.paymentStatus !== "PENDING"
    );
    return {
      ...s,
      salesCount: txns.length,
      totalSalesRevenue: txns.reduce((sum, t) => sum + t.negotiatedPrice, 0),
    };
  });

  return {
    events: state.events,
    suppliers: state.suppliers,
    clients,
    businessBringers,
    sellers,
    tickets,
    transactions,
  };
}

function computeAll(state: ReturnType<typeof rehydrateRelations>) {
  return {
    eventStats: computeEventStats(state.events, state.tickets, state.transactions),
    kpis: computeKPIs(state.tickets, state.transactions),
    topEvents: computeTopEvents(state.tickets, state.events),
    monthlySales: computeMonthlySales(state.transactions),
    channelProfitability: computeChannelProfitability(state.transactions, state.tickets),
    urgentDeliveries: getUrgentDeliveries(state.transactions, state.tickets, state.events),
  };
}

const initial = hydrateSeedData();
const initialHydrated = rehydrateRelations(initial);
const initialComputed = computeAll(initialHydrated);

export const useCrmStore = create<CrmState>((set, get) => ({
  ...initialHydrated,
  ...initialComputed,
  activeDialog: null,
  dialogContext: {},

  openDialog: (type, context) => set({ activeDialog: type, dialogContext: context ?? {} }),
  closeDialog: () => set({ activeDialog: null, dialogContext: {} }),

  refreshComputed: () => {
    set((s) => {
      const hydrated = rehydrateRelations(s);
      return { ...hydrated, ...computeAll(hydrated) };
    });
  },

  addEvent: (data) => {
    const event: Event = {
      id: generateId("evt"),
      name: data.name,
      category: data.category,
      venue: data.venue,
      city: data.city || undefined,
      dateTime: new Date(data.dateTime).toISOString(),
      status: data.status,
      notes: data.notes || undefined,
    };
    set((s) => {
      const next = rehydrateRelations({ ...s, events: [...s.events, event] });
      return { ...next, ...computeAll(next) };
    });
    return event;
  },

  addClient: (data) => {
    const client: Client = {
      id: generateId("cli"),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      acquisitionChannel: data.acquisitionChannel,
      clientType: data.clientType,
      creditBalance: data.creditBalance,
      creditCurrency: data.creditCurrency,
      seatPreferences: data.seatPreferences || undefined,
      totalSpent: 0,
      totalMarginGenerated: 0,
    };
    set((s) => {
      const next = rehydrateRelations({ ...s, clients: [...s.clients, client] });
      return { ...next, ...computeAll(next) };
    });
    return client;
  },

  addBusinessBringer: (data) => {
    const bringer: BusinessBringer = {
      id: generateId("brk"),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company: data.company || undefined,
      commissionRate: data.commissionRate,
      status: data.status,
      notes: data.notes || undefined,
      referralCount: 0,
      totalReferredRevenue: 0,
    };
    set((s) => {
      const next = rehydrateRelations({
        ...s,
        businessBringers: [...s.businessBringers, bringer],
      });
      return { ...next, ...computeAll(next) };
    });
    return bringer;
  },

  addSeller: (data) => {
    const seller: Seller = {
      id: generateId("sll"),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      role: data.role || undefined,
      status: data.status,
      notes: data.notes || undefined,
      salesCount: 0,
      totalSalesRevenue: 0,
    };
    set((s) => {
      const next = rehydrateRelations({ ...s, sellers: [...s.sellers, seller] });
      return { ...next, ...computeAll(next) };
    });
    return seller;
  },

  addTicket: (data) => {
    const seatsPending = data.seatsPending ?? false;
    const ticket: Ticket = {
      id: generateId("tkt"),
      eventId: data.eventId,
      supplierId: data.supplierId || undefined,
      section: data.section || undefined,
      category: data.category || undefined,
      row: seatsPending ? undefined : data.row || undefined,
      seats: seatsPending ? undefined : data.seats || undefined,
      seatsPending,
      ticketType: data.ticketType,
      quantity: data.quantity,
      purchaseUnitPrice: data.purchaseUnitPrice,
      purchaseFees: data.purchaseFees,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: new Date(data.purchaseDate).toISOString(),
      stockStatus: data.stockStatus,
      transferStatus: data.transferStatus,
      targetSalePrice: data.targetSalePrice,
      minimumSalePrice: data.minimumSalePrice,
      saleCurrency: data.saleCurrency,
      resaleFees: 0,
      notes: data.notes || undefined,
    };
    set((s) => {
      const next = rehydrateRelations({ ...s, tickets: [...s.tickets, ticket] });
      return { ...next, ...computeAll(next) };
    });
    return ticket;
  },

  addSale: (data) => {
    let clientId = data.clientId ?? "";

    if (data.createNewClient && data.newClientFirstName && data.newClientLastName) {
      const newClient = get().addClient({
        firstName: data.newClientFirstName,
        lastName: data.newClientLastName,
        phone: data.newClientPhone,
        acquisitionChannel: "WHATSAPP",
        clientType: "REGULAR",
        creditBalance: 0,
        creditCurrency: data.currency,
      });
      clientId = newClient.id;
    }

    const state = get();
    const ticket = state.tickets.find((t) => t.id === data.ticketId);
    if (!ticket) {
      throw new Error("Billet introuvable");
    }

    const soldSoFar = getTicketSoldQuantity(data.ticketId, state.transactions);
    const available = getTicketAvailableQuantity(ticket, state.transactions);
    const soldQuantity = data.soldQuantity ?? 1;

    if (soldQuantity > available) {
      throw new Error(`Stock insuffisant (${available} disponible${available > 1 ? "s" : ""})`);
    }

    const unitSalePrice = data.negotiatedPrice / soldQuantity;
    const fullySold = soldSoFar + soldQuantity >= ticket.quantity;

    const transaction: Transaction = {
      id: generateId("txn"),
      ticketId: data.ticketId,
      clientId,
      businessBringerId: data.businessBringerId || undefined,
      businessBringerCommissionRate: data.businessBringerId
        ? data.businessBringerCommissionRate
        : undefined,
      sellerId: data.sellerId || undefined,
      saleDate: data.saleDate ? new Date(data.saleDate).toISOString() : new Date().toISOString(),
      negotiatedPrice: data.negotiatedPrice,
      currency: data.currency,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      deliveryStatus: data.deliveryStatus,
      resalePlatform: data.resalePlatform,
      soldQuantity,
      seatsPending: Boolean(ticket.seatsPending),
      invoice: data.invoice.enabled ? invoiceFormToInvoice(data.invoice) : undefined,
    };

    set((s) => {
      const tickets = s.tickets.map((t) =>
        t.id === data.ticketId
          ? {
              ...t,
              stockStatus: fullySold ? ("SOLD" as const) : t.stockStatus,
              actualSalePrice: unitSalePrice,
              resalePlatform: data.resalePlatform,
              saleCurrency: data.currency,
              transferStatus:
                t.transferStatus === "SENT_TO_CLIENT"
                  ? t.transferStatus
                  : ("READY_TO_SEND" as const),
            }
          : t
      );
      const next = rehydrateRelations({
        ...s,
        tickets,
        transactions: [...s.transactions, transaction],
      });
      return { ...next, ...computeAll(next) };
    });

    return transaction;
  },

  assignTicketSeats: (ticketId, data) => {
    set((s) => {
      const tickets = s.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              row: data.row || undefined,
              seats: data.seats,
              seatsPending: false,
            }
          : t
      );
      const next = rehydrateRelations({ ...s, tickets });
      return { ...next, ...computeAll(next) };
    });
  },

  assignSaleSeats: (transactionId, data) => {
    set((s) => {
      const transactions = s.transactions.map((txn) => {
        if (txn.id !== transactionId) return txn;

        const ticket = s.tickets.find((t) => t.id === txn.ticketId);
        const updated: Transaction = {
          ...txn,
          assignedRow: data.row || undefined,
          assignedSeats: data.seats,
          seatsPending: false,
        };

        if (updated.invoice && ticket) {
          updated.invoice = {
            ...updated.invoice,
            description: ticketDescription(ticket, txn.soldQuantity, {
              assignedRow: data.row || undefined,
              assignedSeats: data.seats,
              seatsPending: false,
            }),
          };
        }

        return updated;
      });

      const next = rehydrateRelations({ ...s, transactions });
      return { ...next, ...computeAll(next) };
    });
  },

  updateTransactionInvoice: (transactionId, data) => {
    set((s) => {
      const transactions = s.transactions.map((txn) =>
        txn.id === transactionId
          ? { ...txn, invoice: invoiceFormToInvoice(data) }
          : txn
      );
      const next = rehydrateRelations({ ...s, transactions });
      return { ...next, ...computeAll(next) };
    });
  },
}));

export function useCrm() {
  return useCrmStore();
}
