"use client";

import { formatCurrency } from "@/lib/currency";
import { computeInvoiceTotals, KLNA_COMPANY, unitPriceTTCFromHT } from "@/lib/invoice";
import { formatDate } from "@/lib/utils";
import type { Currency, Invoice } from "@/types";
import { cn } from "@/lib/utils";

interface InvoicePreviewProps {
  invoice: Invoice;
  currency: Currency;
  className?: string;
  id?: string;
}

export function InvoicePreview({ invoice, currency, className, id }: InvoicePreviewProps) {
  const { vatAmount, totalTTC } = computeInvoiceTotals(invoice);
  const unitPriceTTC = unitPriceTTCFromHT(invoice.unitPriceHT, invoice.vatRate);
  const lineTotalTTC = unitPriceTTC * invoice.quantity;

  const billingLines = [
    invoice.billingAddress,
    [invoice.billingPostalCode, invoice.billingCity].filter(Boolean).join(" "),
    invoice.billingCountry,
  ].filter(Boolean);

  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-border bg-white p-5 text-zinc-900 shadow-sm print:shadow-none print:border-zinc-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <p className="text-lg font-bold tracking-tight">{KLNA_COMPANY.name}</p>
          <p className="text-xs text-zinc-500">{KLNA_COMPANY.tagline}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
            {KLNA_COMPANY.address}
            <br />
            {KLNA_COMPANY.postalCode} {KLNA_COMPANY.city}
            <br />
            {KLNA_COMPANY.email} · {KLNA_COMPANY.phone}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Facture</p>
          <p className="font-mono text-sm font-bold">{invoice.number}</p>
          <p className="mt-2 text-[11px] text-zinc-600">
            Émise le {formatDate(invoice.issueDate)}
            {invoice.dueDate && (
              <>
                <br />
                Échéance {formatDate(invoice.dueDate)}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Facturé à</p>
          <p className="mt-1 text-sm font-medium">{invoice.billingName}</p>
          {invoice.billingEmail && (
            <p className="text-xs text-zinc-600">{invoice.billingEmail}</p>
          )}
          {billingLines.length > 0 && (
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              {billingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Émetteur</p>
          <p className="mt-1 text-xs text-zinc-600">
            SIRET {KLNA_COMPANY.siret}
            <br />
            TVA {KLNA_COMPANY.vatNumber}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-right font-semibold">Qté</th>
              <th className="px-3 py-2 text-right font-semibold">P.U. TTC</th>
              <th className="px-3 py-2 text-right font-semibold">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-zinc-100">
              <td className="px-3 py-3 align-top">{invoice.description}</td>
              <td className="px-3 py-3 text-right tabular-nums">{invoice.quantity}</td>
              <td className="px-3 py-3 text-right tabular-nums">
                {formatCurrency(unitPriceTTC, currency)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums font-medium">
                {formatCurrency(lineTotalTTC, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-xs">
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatCurrency(totalTTC, currency)}</span>
          </div>
          {invoice.vatRate > 0 && (
            <p className="text-right text-[10px] text-zinc-500">
              Dont TVA ({invoice.vatRate}%) : {formatCurrency(vatAmount, currency)}
            </p>
          )}
        </div>
      </div>

      {(invoice.paymentTerms || invoice.notes) && (
        <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-[11px] text-zinc-600">
          {invoice.paymentTerms && (
            <p>
              <span className="font-semibold text-zinc-700">Conditions : </span>
              {invoice.paymentTerms}
            </p>
          )}
          {invoice.notes && (
            <p>
              <span className="font-semibold text-zinc-700">Notes : </span>
              {invoice.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
