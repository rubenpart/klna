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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions, FormField, FormRow } from "@/components/forms/form-field";
import { ticketFormSchema, type TicketFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";
import { TICKET_TYPE_LABELS } from "@/types";

export function TicketFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addTicket = useCrmStore((s) => s.addTicket);
  const events = useCrmStore((s) => s.events);
  const suppliers = useCrmStore((s) => s.suppliers);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      eventId: "",
      supplierId: "",
      section: "",
      category: "",
      row: "",
      seats: "",
      ticketType: "E_TICKET_PDF",
      quantity: 1,
      purchaseUnitPrice: 0,
      purchaseFees: 0,
      purchaseCurrency: "EUR",
      purchaseDate: new Date().toISOString().slice(0, 16),
      targetSalePrice: undefined,
      saleCurrency: "EUR",
      stockStatus: "IN_STOCK",
      transferStatus: "IN_STOCK",
      notes: "",
    },
  });

  useEffect(() => {
    if (activeDialog === "ticket" && dialogContext.eventId) {
      form.setValue("eventId", dialogContext.eventId);
    }
  }, [activeDialog, dialogContext.eventId, form]);

  const onSubmit = form.handleSubmit((data) => {
    addTicket(data);
    form.reset();
    closeDialog();
  });

  const selectedEvent = events.find((e) => e.id === form.watch("eventId"));

  return (
    <Dialog open={activeDialog === "ticket"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau Billet</DialogTitle>
          <DialogDescription>
            Ajouter du stock pour un événement
            {selectedEvent ? ` — ${selectedEvent.name}` : ""}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormRow>
            <FormField label="Événement" error={form.formState.errors.eventId?.message} required>
              <Select
                value={form.watch("eventId")}
                onValueChange={(v) => form.setValue("eventId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {events.filter((e) => e.status === "UPCOMING").map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Fournisseur">
              <Select
                value={form.watch("supplierId") ?? ""}
                onValueChange={(v) => form.setValue("supplierId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormRow cols={3}>
            <FormField label="Section">
              <Input {...form.register("section")} placeholder="Tribune Nord" />
            </FormField>
            <FormField label="Catégorie">
              <Input {...form.register("category")} placeholder="Gold, Cat 1..." />
            </FormField>
            <FormField label="Type billet">
              <Select
                value={form.watch("ticketType")}
                onValueChange={(v) => form.setValue("ticketType", v as TicketFormValues["ticketType"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormRow cols={3}>
            <FormField label="Rang">
              <Input {...form.register("row")} />
            </FormField>
            <FormField label="Sièges">
              <Input {...form.register("seats")} placeholder="12-14" />
            </FormField>
            <FormField label="Quantité" required>
              <Input type="number" min={1} {...form.register("quantity")} />
            </FormField>
          </FormRow>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financials — Achat</p>
            <FormRow cols={3}>
              <FormField label="Prix unitaire" error={form.formState.errors.purchaseUnitPrice?.message} required>
                <Input type="number" min={0} step={0.01} {...form.register("purchaseUnitPrice")} />
              </FormField>
              <FormField label="Frais achat">
                <Input type="number" min={0} step={0.01} {...form.register("purchaseFees")} />
              </FormField>
              <FormField label="Devise">
                <Select
                  value={form.watch("purchaseCurrency")}
                  onValueChange={(v) => {
                    form.setValue("purchaseCurrency", v as TicketFormValues["purchaseCurrency"]);
                    form.setValue("saleCurrency", v as TicketFormValues["saleCurrency"]);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormRow>
            <FormField label="Date d'achat" required>
              <Input type="datetime-local" {...form.register("purchaseDate")} />
            </FormField>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financials — Vente cible</p>
            <FormRow>
              <FormField label="Prix de vente cible">
                <Input type="number" min={0} step={0.01} {...form.register("targetSalePrice")} />
              </FormField>
              <FormField label="Statut stock">
                <Select
                  value={form.watch("stockStatus")}
                  onValueChange={(v) => form.setValue("stockStatus", v as TicketFormValues["stockStatus"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">En stock</SelectItem>
                    <SelectItem value="RESERVED">Réservé</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </FormRow>
          </div>

          <FormField label="Notes">
            <Textarea {...form.register("notes")} rows={2} />
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button type="submit">Ajouter au stock</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
