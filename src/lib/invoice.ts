import type { Client, Currency, Invoice, Ticket, Transaction } from "@/types";
import type { InvoiceFormValues } from "@/lib/validations/crm";
import { getAppNow } from "@/lib/demo-time";

export const KLNA_COMPANY = {
  name: "KLNA Conciergerie",
  tagline: "Conciergerie événementielle",
  address: "12 Avenue Montaigne",
  postalCode: "75008",
  city: "Paris",
  country: "France",
  email: "contact@klna-conciergerie.fr",
  phone: "+33 1 42 00 00 00",
  siret: "123 456 789 00012",
  vatNumber: "FR12 345678901",
} as const;

export function generateInvoiceNumber(existingCount: number, date = getAppNow()): string {
  const year = date.getFullYear();
  const seq = String(existingCount + 1).padStart(4, "0");
  return `FAC-${year}-${seq}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ticketDescription(
  ticket?: Ticket,
  soldQuantity?: number,
  options?: {
    seatsPending?: boolean;
    assignedRow?: string;
    assignedSeats?: string;
  }
): string {
  if (!ticket) return "Prestation de conciergerie — billet(s) d'événement";
  const qty = soldQuantity ?? ticket.quantity;
  const parts = [ticket.event?.name ?? "Événement"];
  if (ticket.section) parts.push(ticket.section);
  if (ticket.category) parts.push(ticket.category);

  const row = options?.assignedRow ?? ticket.row;
  const seats = options?.assignedSeats ?? ticket.seats;
  const pending = options?.seatsPending ?? ticket.seatsPending;

  if (row) parts.push(`Rang ${row}`);
  if (seats) {
    parts.push(`Places ${seats}`);
  } else if (pending) {
    parts.push("Places à confirmer");
  }

  return `${parts.join(" — ")} (×${qty})`;
}

export function salePlacementLabel(
  ticket?: Ticket,
  transaction?: Pick<Transaction, "seatsPending" | "assignedRow" | "assignedSeats">
): string {
  if (!ticket && !transaction) return "—";
  if (transaction?.assignedSeats) {
    const parts: string[] = [];
    if (transaction.assignedRow) parts.push(`Rang ${transaction.assignedRow}`);
    parts.push(`Places ${transaction.assignedSeats}`);
    return parts.join(" · ");
  }
  if (transaction?.seatsPending || ticket?.seatsPending) {
    return "Places à confirmer";
  }
  const parts: string[] = [];
  if (ticket?.section) parts.push(ticket.section);
  if (ticket?.row) parts.push(`Rang ${ticket.row}`);
  if (ticket?.seats) parts.push(`Places ${ticket.seats}`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function computeInvoiceTotals(invoice: Pick<Invoice, "quantity" | "unitPriceHT" | "vatRate">) {
  const totalHT = invoice.quantity * invoice.unitPriceHT;
  const vatAmount = totalHT * (invoice.vatRate / 100);
  const totalTTC = totalHT + vatAmount;
  return { totalHT, vatAmount, totalTTC };
}

export function unitPriceTTCFromHT(unitPriceHT: number, vatRate: number): number {
  return Math.round(unitPriceHT * (1 + vatRate / 100) * 100) / 100;
}

export function unitPriceHTFromUnitTTC(unitPriceTTC: number, vatRate: number): number {
  if (vatRate <= 0) return unitPriceTTC;
  return Math.round((unitPriceTTC / (1 + vatRate / 100)) * 100) / 100;
}

export function unitPriceHTFromTTC(totalTTC: number, quantity: number, vatRate: number): number {
  if (quantity <= 0) return 0;
  const totalHT = totalTTC / (1 + vatRate / 100);
  return Math.round((totalHT / quantity) * 100) / 100;
}

export function getDefaultVatRate(phone?: string | null): number {
  if (!phone) return 0;
  const normalized = phone.replace(/\s/g, "");
  return normalized.startsWith("+971") ? 5 : 0;
}

export function buildDefaultInvoice(params: {
  existingInvoiceCount: number;
  client?: Client;
  clientPhone?: string;
  newClient?: { firstName: string; lastName: string; phone?: string };
  ticket?: Ticket;
  soldQuantity?: number;
  negotiatedPrice: number;
  currency: Currency;
  paymentStatus?: "PAID" | "DEPOSIT" | "PENDING";
}): InvoiceFormValues {
  const issueDate = getAppNow().toISOString().slice(0, 10);
  const vatRate = getDefaultVatRate(
    params.clientPhone ?? params.newClient?.phone ?? params.client?.phone
  );
  const quantity = params.soldQuantity ?? params.ticket?.quantity ?? 1;
  const billingName = params.newClient
    ? `${params.newClient.firstName} ${params.newClient.lastName}`.trim()
    : params.client
      ? `${params.client.firstName} ${params.client.lastName}`.trim()
      : "";

  const paymentTerms =
    params.paymentStatus === "PAID"
      ? "Facture acquittée"
      : params.paymentStatus === "DEPOSIT"
        ? "Solde à régler avant l'événement"
        : "Paiement à réception de facture — 30 jours";

  return {
    enabled: true,
    number: generateInvoiceNumber(params.existingInvoiceCount),
    issueDate,
    dueDate: addDaysIso(issueDate, 30),
    billingName,
    billingEmail: params.client?.email ?? "",
    billingAddress: "",
    billingPostalCode: "",
    billingCity: "",
    billingCountry: "France",
    description: ticketDescription(params.ticket, quantity, {
      seatsPending: params.ticket?.seatsPending,
    }),
    quantity,
    unitPriceHT: unitPriceHTFromTTC(params.negotiatedPrice, quantity, vatRate),
    vatRate,
    notes: "",
    paymentTerms,
  };
}

export function invoiceFormToInvoice(values: InvoiceFormValues): Invoice {
  const { enabled: _, ...invoice } = values;
  return invoice;
}
