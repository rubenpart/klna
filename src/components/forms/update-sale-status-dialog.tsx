"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions, FormField, FormRow } from "@/components/forms/form-field";
import { salePlacementLabel } from "@/lib/invoice";
import {
  updateSaleStatusFormSchema,
  type UpdateSaleStatusFormValues,
} from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/types";

export function UpdateSaleStatusDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const updateTransactionStatus = useCrmStore((s) => s.updateTransactionStatus);
  const transactions = useCrmStore((s) => s.transactions);

  const transaction = transactions.find((t) => t.id === dialogContext.transactionId);

  const form = useForm<UpdateSaleStatusFormValues>({
    resolver: zodResolver(updateSaleStatusFormSchema),
    defaultValues: {
      paymentStatus: "PAID",
      deliveryStatus: "TO_DELIVER",
      notes: "",
    },
  });

  useEffect(() => {
    if (activeDialog === "updateSaleStatus" && transaction) {
      form.reset({
        paymentStatus: transaction.paymentStatus,
        paymentMethod: transaction.paymentMethod,
        deliveryStatus: transaction.deliveryStatus,
        notes: transaction.notes ?? "",
      });
    }
  }, [activeDialog, form, transaction]);

  const onSubmit = form.handleSubmit((data) => {
    if (!dialogContext.transactionId) return;
    updateTransactionStatus(dialogContext.transactionId, data);
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "updateSaleStatus"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Mettre à jour la vente
          </DialogTitle>
          <DialogDescription>
            {transaction?.client?.firstName} {transaction?.client?.lastName}
            {transaction?.ticket?.event?.name ? ` — ${transaction.ticket.event.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {transaction ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Billet</p>
              <p className="font-medium">{salePlacementLabel(transaction.ticket, transaction)}</p>
              <p className="text-xs text-muted-foreground">×{transaction.soldQuantity ?? 1}</p>
            </div>

            <FormRow cols={2}>
              <FormField label="Statut paiement" required>
                <Select
                  value={form.watch("paymentStatus")}
                  onValueChange={(v) =>
                    form.setValue("paymentStatus", v as UpdateSaleStatusFormValues["paymentStatus"])
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PAYMENT_STATUS_LABELS) as Array<keyof typeof PAYMENT_STATUS_LABELS>).map(
                      (key) => (
                        <SelectItem key={key} value={key}>
                          {PAYMENT_STATUS_LABELS[key]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Mode de paiement">
                <Select
                  value={form.watch("paymentMethod") ?? ""}
                  onValueChange={(v) =>
                    form.setValue(
                      "paymentMethod",
                      v ? (v as UpdateSaleStatusFormValues["paymentMethod"]) : undefined
                    )
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Non renseigné" /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as Array<keyof typeof PAYMENT_METHOD_LABELS>).map(
                      (key) => (
                        <SelectItem key={key} value={key}>
                          {PAYMENT_METHOD_LABELS[key]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormField>
            </FormRow>

            <FormField label="Statut livraison" required>
              <Select
                value={form.watch("deliveryStatus")}
                onValueChange={(v) =>
                  form.setValue("deliveryStatus", v as UpdateSaleStatusFormValues["deliveryStatus"])
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DELIVERY_STATUS_LABELS) as Array<keyof typeof DELIVERY_STATUS_LABELS>).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {DELIVERY_STATUS_LABELS[key]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Détails / notes">
              <Textarea
                {...form.register("notes")}
                rows={3}
                placeholder="Virement reçu, transfert effectué, relance client..."
              />
            </FormField>

            <FormActions>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </FormActions>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Vente introuvable.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
