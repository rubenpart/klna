"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormRow } from "@/components/forms/form-field";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import type { SaleFormValues } from "@/lib/validations/crm";
import { invoiceFormToInvoice } from "@/lib/invoice";
import type { Currency } from "@/types";

interface InvoiceEditorProps {
  form: UseFormReturn<SaleFormValues>;
  currency: Currency;
  onRefresh: () => void;
}

export function InvoiceEditor({ form, currency, onRefresh }: InvoiceEditorProps) {
  const invoiceEnabled = form.watch("invoice.enabled");
  const invoiceValues = form.watch("invoice");
  const invoiceErrors = form.formState.errors.invoice;

  if (!invoiceEnabled) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Activez la génération de facture pour éditer et prévisualiser le document.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Informations facture</p>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            Actualiser depuis la vente
          </Button>
        </div>

        <FormRow>
          <FormField label="N° facture" error={invoiceErrors?.number?.message} required>
            <Input {...form.register("invoice.number")} />
          </FormField>
          <FormField label="Date d'émission" error={invoiceErrors?.issueDate?.message} required>
            <Input type="date" {...form.register("invoice.issueDate")} />
          </FormField>
        </FormRow>

        <FormField label="Date d'échéance">
          <Input type="date" {...form.register("invoice.dueDate")} />
        </FormField>

        <FormField label="Client facturé" error={invoiceErrors?.billingName?.message} required>
          <Input {...form.register("invoice.billingName")} />
        </FormField>

        <FormField label="Email">
          <Input type="email" {...form.register("invoice.billingEmail")} />
        </FormField>

        <FormField label="Adresse">
          <Input {...form.register("invoice.billingAddress")} placeholder="Rue, numéro..." />
        </FormField>

        <FormRow cols={3}>
          <FormField label="Code postal">
            <Input {...form.register("invoice.billingPostalCode")} />
          </FormField>
          <FormField label="Ville">
            <Input {...form.register("invoice.billingCity")} />
          </FormField>
          <FormField label="Pays">
            <Input {...form.register("invoice.billingCountry")} />
          </FormField>
        </FormRow>

        <FormField label="Description" error={invoiceErrors?.description?.message} required>
          <Textarea {...form.register("invoice.description")} rows={2} />
        </FormField>

        <FormRow cols={3}>
          <FormField label="Quantité" error={invoiceErrors?.quantity?.message} required>
            <Input type="number" min={1} {...form.register("invoice.quantity")} />
          </FormField>
          <FormField label="P.U. HT" error={invoiceErrors?.unitPriceHT?.message} required>
            <Input type="number" min={0} step={0.01} {...form.register("invoice.unitPriceHT")} />
          </FormField>
          <FormField label="TVA (%)" error={invoiceErrors?.vatRate?.message}>
            <Input type="number" min={0} max={100} step={0.1} {...form.register("invoice.vatRate")} />
          </FormField>
        </FormRow>

        <FormField label="Conditions de paiement">
          <Input {...form.register("invoice.paymentTerms")} />
        </FormField>

        <FormField label="Notes facture">
          <Textarea {...form.register("invoice.notes")} rows={2} placeholder="Mentions complémentaires..." />
        </FormField>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Aperçu</p>
        <InvoicePreview
          invoice={invoiceFormToInvoice(invoiceValues)}
          currency={currency}
        />
      </div>
    </div>
  );
}
