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
import type { Client, Event, Supplier, Ticket, Transaction } from "@/types";
import type {
  ClientFormValues,
  EventFormValues,
  SaleFormValues,
  TicketFormValues,
} from "@/lib/validations/crm";

export type FormDialogType = "event" | "client" | "ticket" | "sale" | null;

interface CrmState {
  events: Event[];
  suppliers: Supplier[];
  clients: Client[];
  tickets: Ticket[];
  transactions: Transaction[];
  activeDialog: FormDialogType;
  dialogContext: { eventId?: string; ticketId?: string };

  eventStats: EventWithStats[];
  kpis: ReturnType<typeof computeKPIs>;
  topEvents: ReturnType<typeof computeTopEvents>;
  monthlySales: ReturnType<typeof computeMonthlySales>;
  channelProfitability: ReturnType<typeof computeChannelProfitability>;
  urgentDeliveries: ReturnType<typeof getUrgentDeliveries>;

  openDialog: (type: FormDialogType, context?: { eventId?: string; ticketId?: string }) => void;
  closeDialog: () => void;

  addEvent: (data: EventFormValues) => Event;
  addClient: (data: ClientFormValues) => Client;
  addTicket: (data: TicketFormValues) => Ticket;
  addSale: (data: SaleFormValues) => Transaction;
}

function generateId(prefix: string): string {
  return `klna_${prefix}_${Date.now().toString(36)}`;
}

function rehydrateRelations(state: Pick<CrmState, "events" | "suppliers" | "clients" | "tickets" | "transactions">) {
  const eventMap = new Map(state.events.map((e) => [e.id, e]));
  const supplierMap = new Map(state.suppliers.map((s) => [s.id, s]));

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
  }));

  const clients = state.clients.map((c) => {
    const clientTxns = transactions.filter(
      (t) => t.clientId === c.id && t.paymentStatus !== "PENDING"
    );
    return { ...c, totalSpent: clientTxns.reduce((s, t) => s + t.negotiatedPrice, 0) };
  });

  return { events: state.events, suppliers: state.suppliers, clients, tickets, transactions };
}

function computeAll(state: ReturnType<typeof rehydrateRelations>) {
  return {
    eventStats: computeEventStats(state.events, state.tickets),
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

  addTicket: (data) => {
    const ticket: Ticket = {
      id: generateId("tkt"),
      eventId: data.eventId,
      supplierId: data.supplierId || undefined,
      section: data.section || undefined,
      category: data.category || undefined,
      row: data.row || undefined,
      seats: data.seats || undefined,
      ticketType: data.ticketType,
      quantity: data.quantity,
      purchaseUnitPrice: data.purchaseUnitPrice,
      purchaseFees: data.purchaseFees,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: new Date(data.purchaseDate).toISOString(),
      stockStatus: data.stockStatus,
      transferStatus: data.transferStatus,
      targetSalePrice: data.targetSalePrice,
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

    const transaction: Transaction = {
      id: generateId("txn"),
      ticketId: data.ticketId,
      clientId,
      saleDate: data.saleDate ? new Date(data.saleDate).toISOString() : new Date().toISOString(),
      negotiatedPrice: data.negotiatedPrice,
      currency: data.currency,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      deliveryStatus: data.deliveryStatus,
      resalePlatform: data.resalePlatform,
    };

    set((s) => {
      const tickets = s.tickets.map((t) =>
        t.id === data.ticketId
          ? {
              ...t,
              stockStatus: "SOLD" as const,
              actualSalePrice: data.negotiatedPrice / (t.quantity || 1),
              resalePlatform: data.resalePlatform,
              saleCurrency: data.currency,
              transferStatus: "READY_TO_SEND" as const,
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
}));

export function useCrm() {
  return useCrmStore();
}
