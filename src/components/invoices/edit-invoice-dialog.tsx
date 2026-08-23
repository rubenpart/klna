"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormActions, FormField, FormRow } from "@/components/forms/form-field";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import type { Invoice } from "@/types";
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";

function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    enabled: true,
    number: invoice.number,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate ?? "",
    billingName: invoice.billingName,
    billingEmail: invoice.billingEmail ?? "",
    billingAddress: invoice.billingAddress ?? "",
    billingPostalCode: invoice.billingPostalCode ?? "",
    billingCity: invoice.billingCity ?? "",
    billingCountry: invoice.billingCountry ?? "France",
    description: invoice.description,
    quantity: invoice.quantity,
    unitPriceHT: invoice.unitPriceHT,
    vatRate: invoice.vatRate,
    notes: invoice.notes ?? "",
    paymentTerms: invoice.paymentTerms ?? "",
  };
}

export function EditInvoiceDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const updateTransactionInvoice = useCrmStore((s) => s.updateTransactionInvoice);
  const transactions = useCrmStore((s) => s.transactions);

  const transaction = transactions.find((t) => t.id === dialogContext.transactionId);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      enabled: true,
      number: "",
      issueDate: "",
      billingName: "",
      description: "",
      quantity: 1,
      unitPriceHT: 0,
      vatRate: 0,
    },
  });

  useEffect(() => {
    if (activeDialog === "editInvoice" && transaction?.invoice) {
      form.reset(invoiceToFormValues(transaction.invoice));
    }
  }, [activeDialog, form, transaction]);

  const onSubmit = form.handleSubmit((data) => {
    if (!dialogContext.transactionId) return;
    updateTransactionInvoice(dialogContext.transactionId, data);
    closeDialog();
  });

  const invoiceValues = form.watch();

  return (
    <Dialog open={activeDialog === "editInvoice"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture {transaction?.invoice?.number}</DialogTitle>
          <DialogDescription>
            {transaction?.client?.firstName} {transaction?.client?.lastName} —{" "}
            {transaction?.ticket?.event?.name}
          </DialogDescription>
        </DialogHeader>

        {transaction?.invoice ? (
          <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <FormRow>
                <FormField label="N° facture" error={form.formState.errors.number?.message} required>
                  <Input {...form.register("number")} />
                </FormField>
                <FormField label="Date d'émission" error={form.formState.errors.issueDate?.message} required>
                  <Input type="date" {...form.register("issueDate")} />
                </FormField>
              </FormRow>

              <FormField label="Client facturé" error={form.formState.errors.billingName?.message} required>
                <Input {...form.register("billingName")} />
              </FormField>

              <FormField label="Description" error={form.formState.errors.description?.message} required>
                <Textarea {...form.register("description")} rows={3} />
              </FormField>

              <FormRow cols={3}>
                <FormField label="Quantité" error={form.formState.errors.quantity?.message} required>
                  <Input type="number" min={1} {...form.register("quantity")} />
                </FormField>
                <FormField label="Prix unitaire HT" error={form.formState.errors.unitPriceHT?.message} required>
                  <Input type="number" min={0} step={0.01} {...form.register("unitPriceHT")} />
                </FormField>
                <FormField label="TVA %" error={form.formState.errors.vatRate?.message} required>
                  <Input type="number" min={0} max={100} {...form.register("vatRate")} />
                </FormField>
              </FormRow>

              <FormField label="Notes">
                <Textarea {...form.register("notes")} rows={2} />
              </FormField>

              <FormActions>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </FormActions>
            </div>

            <div className="min-h-0 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-2">
              <InvoicePreview
                invoice={{
                  number: invoiceValues.number,
                  issueDate: invoiceValues.issueDate,
                  dueDate: invoiceValues.dueDate,
                  billingName: invoiceValues.billingName,
                  billingEmail: invoiceValues.billingEmail,
                  billingAddress: invoiceValues.billingAddress,
                  billingPostalCode: invoiceValues.billingPostalCode,
                  billingCity: invoiceValues.billingCity,
                  billingCountry: invoiceValues.billingCountry,
                  description: invoiceValues.description,
                  quantity: Number(invoiceValues.quantity) || 1,
                  unitPriceHT: Number(invoiceValues.unitPriceHT) || 0,
                  vatRate: Number(invoiceValues.vatRate) || 0,
                  notes: invoiceValues.notes,
                  paymentTerms: invoiceValues.paymentTerms,
                }}
                currency={transaction.currency}
              />
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune facture à modifier.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
