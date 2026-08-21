"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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
import { saleFormSchema, type SaleFormValues } from "@/lib/validations/crm";
import { formatCurrency } from "@/lib/currency";
import { useCrmStore } from "@/stores/crm-store";
import { RESALE_PLATFORM_LABELS } from "@/types";

export function SaleFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addSale = useCrmStore((s) => s.addSale);
  const tickets = useCrmStore((s) => s.tickets);
  const clients = useCrmStore((s) => s.clients);

  const availableTickets = useMemo(
    () => tickets.filter((t) => t.stockStatus === "IN_STOCK" || t.stockStatus === "RESERVED"),
    [tickets]
  );

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      ticketId: "",
      clientId: "",
      negotiatedPrice: 0,
      currency: "EUR",
      paymentStatus: "PAID",
      paymentMethod: "BANK_TRANSFER",
      deliveryStatus: "TO_DELIVER",
      resalePlatform: "WHATSAPP",
      createNewClient: false,
      newClientFirstName: "",
      newClientLastName: "",
      newClientPhone: "",
      notes: "",
    },
  });

  const createNewClient = form.watch("createNewClient");
  const selectedTicketId = form.watch("ticketId");
  const selectedTicket = availableTickets.find((t) => t.id === selectedTicketId);

  useEffect(() => {
    if (activeDialog === "sale") {
      if (dialogContext.ticketId) form.setValue("ticketId", dialogContext.ticketId);
      if (selectedTicket?.targetSalePrice) {
        form.setValue("negotiatedPrice", selectedTicket.targetSalePrice * (selectedTicket.quantity || 1));
        form.setValue("currency", selectedTicket.saleCurrency);
      }
    }
  }, [activeDialog, dialogContext.ticketId, selectedTicket, form]);

  const onSubmit = form.handleSubmit((data) => {
    addSale(data);
    form.reset();
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "sale"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Vente Express</DialogTitle>
          <DialogDescription>Enregistrer une vente ou réservation rapidement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Billet en stock" error={form.formState.errors.ticketId?.message} required>
            <Select
              value={form.watch("ticketId")}
              onValueChange={(v) => {
                form.setValue("ticketId", v);
                const t = availableTickets.find((x) => x.id === v);
                if (t?.targetSalePrice) {
                  form.setValue("negotiatedPrice", t.targetSalePrice * t.quantity);
                  form.setValue("currency", t.saleCurrency);
                }
              }}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner un billet..." /></SelectTrigger>
              <SelectContent>
                {availableTickets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.event?.name} — {t.section} {t.seats} (×{t.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {selectedTicket && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
              <p className="font-medium">{selectedTicket.event?.name}</p>
              <p className="text-muted-foreground">
                Achat : {formatCurrency(selectedTicket.purchaseUnitPrice, selectedTicket.purchaseCurrency)} × {selectedTicket.quantity}
                {selectedTicket.targetSalePrice && (
                  <> · Cible : {formatCurrency(selectedTicket.targetSalePrice, selectedTicket.saleCurrency)}</>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="createNewClient"
              checked={createNewClient}
              onChange={(e) => form.setValue("createNewClient", e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="createNewClient" className="text-sm">Créer un nouveau client</label>
          </div>

          {createNewClient ? (
            <FormRow cols={3}>
              <FormField label="Prénom" required>
                <Input {...form.register("newClientFirstName")} />
              </FormField>
              <FormField label="Nom" required>
                <Input {...form.register("newClientLastName")} />
              </FormField>
              <FormField label="Téléphone">
                <Input {...form.register("newClientPhone")} />
              </FormField>
            </FormRow>
          ) : (
            <FormField label="Client" error={form.formState.errors.clientId?.message} required>
              <Select
                value={form.watch("clientId")}
                onValueChange={(v) => form.setValue("clientId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner un client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.clientType === "VIP" ? "★" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormRow cols={3}>
            <FormField label="Prix négocié" error={form.formState.errors.negotiatedPrice?.message} required>
              <Input type="number" min={0} step={0.01} {...form.register("negotiatedPrice")} />
            </FormField>
            <FormField label="Devise">
              <Select
                value={form.watch("currency")}
                onValueChange={(v) => form.setValue("currency", v as SaleFormValues["currency"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Canal revente">
              <Select
                value={form.watch("resalePlatform")}
                onValueChange={(v) => form.setValue("resalePlatform", v as SaleFormValues["resalePlatform"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RESALE_PLATFORM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormRow cols={3}>
            <FormField label="Paiement">
              <Select
                value={form.watch("paymentStatus")}
                onValueChange={(v) => form.setValue("paymentStatus", v as SaleFormValues["paymentStatus"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Payé</SelectItem>
                  <SelectItem value="DEPOSIT">Acompte</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Mode">
              <Select
                value={form.watch("paymentMethod") ?? ""}
                onValueChange={(v) => form.setValue("paymentMethod", v as SaleFormValues["paymentMethod"])}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                  <SelectItem value="CARD">Carte</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Livraison">
              <Select
                value={form.watch("deliveryStatus")}
                onValueChange={(v) => form.setValue("deliveryStatus", v as SaleFormValues["deliveryStatus"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TO_DELIVER">À livrer</SelectItem>
                  <SelectItem value="DELIVERED">Livré</SelectItem>
                  <SelectItem value="TRANSFER_COMPLETED">Transfert effectué</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormField label="Notes">
            <Textarea {...form.register("notes")} rows={2} placeholder="Prix négocié, conditions..." />
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button type="submit">Enregistrer la vente</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
