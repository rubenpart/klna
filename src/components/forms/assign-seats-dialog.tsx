"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
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
import { FormActions, FormField, FormRow } from "@/components/forms/form-field";
import { assignSeatsFormSchema, type AssignSeatsFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";

export function AssignSeatsDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const assignTicketSeats = useCrmStore((s) => s.assignTicketSeats);
  const assignSaleSeats = useCrmStore((s) => s.assignSaleSeats);
  const tickets = useCrmStore((s) => s.tickets);
  const transactions = useCrmStore((s) => s.transactions);

  const mode = dialogContext.assignMode ?? (dialogContext.transactionId ? "sale" : "ticket");
  const ticket =
    mode === "ticket"
      ? tickets.find((t) => t.id === dialogContext.ticketId)
      : transactions.find((t) => t.id === dialogContext.transactionId)?.ticket;
  const transaction =
    mode === "sale"
      ? transactions.find((t) => t.id === dialogContext.transactionId)
      : undefined;

  const form = useForm<AssignSeatsFormValues>({
    resolver: zodResolver(assignSeatsFormSchema),
    defaultValues: { row: "", seats: "" },
  });

  useEffect(() => {
    if (activeDialog !== "assignSeats") return;

    if (mode === "sale" && transaction) {
      form.reset({
        row: transaction.assignedRow ?? ticket?.row ?? "",
        seats: transaction.assignedSeats ?? "",
      });
      return;
    }

    form.reset({
      row: ticket?.row ?? "",
      seats: ticket?.seats ?? "",
    });
  }, [activeDialog, form, mode, ticket, transaction]);

  const onSubmit = form.handleSubmit((data) => {
    if (mode === "sale" && dialogContext.transactionId) {
      assignSaleSeats(dialogContext.transactionId, data);
    } else if (dialogContext.ticketId) {
      assignTicketSeats(dialogContext.ticketId, data);
    }
    closeDialog();
  });

  const title = mode === "sale" ? "Attribuer les places — vente" : "Attribuer les places — lot";
  const description =
    mode === "sale"
      ? `Places pour ${transaction?.client?.firstName ?? ""} ${transaction?.client?.lastName ?? ""} · ${transaction?.soldQuantity ?? 1} billet(s)`
      : `Lot de ${ticket?.quantity ?? 0} billet(s) · ${ticket?.event?.name ?? "Événement"}`;

  return (
    <Dialog open={activeDialog === "assignSeats"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {ticket && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Catégorie</p>
              <p className="font-medium">
                {[ticket.section, ticket.category].filter(Boolean).join(" — ") || "—"}
              </p>
            </div>
          )}

          <FormRow cols={2}>
            <FormField label="Rang">
              <Input {...form.register("row")} placeholder="12, A..." />
            </FormField>
            <FormField label="Places" error={form.formState.errors.seats?.message} required>
              <Input {...form.register("seats")} placeholder="14-15, 101-104..." />
            </FormField>
          </FormRow>

          <p className="text-xs text-muted-foreground">
            {mode === "sale"
              ? "La description de la facture sera mise à jour automatiquement si une facture est associée."
              : "Une fois attribuées, les places apparaîtront dans l'inventaire et pourront être sélectionnées à la vente."}
          </p>

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les places</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
