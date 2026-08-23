import type { Invoice } from "@/types";
import { unitPriceHTFromTTC } from "@/lib/invoice";

export function seedInvoice(params: {
  number: string;
  issueDate: string;
  dueDate: string;
  billingName: string;
  billingEmail?: string;
  billingAddress?: string;
  billingPostalCode?: string;
  billingCity?: string;
  description: string;
  quantity: number;
  totalTTC: number;
  vatRate?: number;
  paymentTerms?: string;
  notes?: string;
}): Invoice {
  const vatRate = params.vatRate ?? 20;
  return {
    number: params.number,
    issueDate: params.issueDate,
    dueDate: params.dueDate,
    billingName: params.billingName,
    billingEmail: params.billingEmail,
    billingAddress: params.billingAddress,
    billingPostalCode: params.billingPostalCode,
    billingCity: params.billingCity,
    billingCountry: "France",
    description: params.description,
    quantity: params.quantity,
    unitPriceHT: unitPriceHTFromTTC(params.totalTTC, params.quantity, vatRate),
    vatRate,
    paymentTerms: params.paymentTerms,
    notes: params.notes,
  };
}
