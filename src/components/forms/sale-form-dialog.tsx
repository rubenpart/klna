"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ExchangeRateField } from "@/components/forms/exchange-rate-field";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
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
import { InvoiceEditor } from "@/components/invoices/invoice-editor";
import { buildDefaultInvoice } from "@/lib/invoice";
import {
  getTicketAvailableQuantity,
  groupStockByTicketType,
  isTicketSellable,
} from "@/lib/ticket-stock";
import { saleFormSchema, type SaleFormValues } from "@/lib/validations/crm";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCrmStore } from "@/stores/crm-store";
import { RESALE_PLATFORM_LABELS, TICKET_TYPE_LABELS } from "@/types";

type SaleTab = "sale" | "invoice";

export function SaleFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addSale = useCrmStore((s) => s.addSale);
  const tickets = useCrmStore((s) => s.tickets);
  const clients = useCrmStore((s) => s.clients);
  const transactions = useCrmStore((s) => s.transactions);
  const businessBringers = useCrmStore((s) => s.businessBringers);
  const sellers = useCrmStore((s) => s.sellers);

  const [activeTab, setActiveTab] = useState<SaleTab>("sale");

  const invoiceCount = useMemo(
    () => transactions.filter((t) => t.invoice).length,
    [transactions]
  );

  const activeBringers = useMemo(
    () => businessBringers.filter((b) => b.status === "ACTIVE"),
    [businessBringers]
  );
  const activeSellers = useMemo(
    () => sellers.filter((s) => s.status === "ACTIVE"),
    [sellers]
  );

  const availableTickets = useMemo(
    () => tickets.filter((t) => isTicketSellable(t, transactions)),
    [tickets, transactions]
  );

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      ticketId: "",
      clientId: "",
      soldQuantity: 1,
      negotiatedPrice: 0,
      currency: "EUR",
      exchangeRateToEur: 1,
      paymentStatus: "PAID",
      paymentMethod: "BANK_TRANSFER",
      deliveryStatus: "TO_DELIVER",
      resalePlatform: "WHATSAPP",
      businessBringerId: "",
      businessBringerCommissionRate: undefined,
      sellerId: "",
      createNewClient: false,
      newClientFirstName: "",
      newClientLastName: "",
      newClientPhone: "",
      notes: "",
      invoice: buildDefaultInvoice({
        existingInvoiceCount: 0,
        negotiatedPrice: 0,
        currency: "EUR",
      }),
    },
  });

  const createNewClient = form.watch("createNewClient");
  const newClientPhone = form.watch("newClientPhone");
  const selectedTicketId = form.watch("ticketId");
  const selectedClientId = form.watch("clientId");
  const soldQuantity = form.watch("soldQuantity");
  const negotiatedPrice = form.watch("negotiatedPrice");
  const currency = form.watch("currency");
  const exchangeRate = useExchangeRate(currency);

  useEffect(() => {
    if (!exchangeRate.manual) {
      form.setValue("exchangeRateToEur", exchangeRate.rate);
    }
  }, [exchangeRate.manual, exchangeRate.rate, form]);

  const paymentStatus = form.watch("paymentStatus");
  const invoiceEnabled = form.watch("invoice.enabled");
  const businessBringerId = form.watch("businessBringerId");
  const selectedBringer = activeBringers.find((b) => b.id === businessBringerId);
  const selectedTicket = availableTickets.find((t) => t.id === selectedTicketId);
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const availableQty = selectedTicket
    ? getTicketAvailableQuantity(selectedTicket, transactions)
    : 0;

  const stockByType = useMemo(() => {
    const eventId = selectedTicket?.eventId;
    if (!eventId) return groupStockByTicketType(availableTickets, transactions);
    return groupStockByTicketType(availableTickets, transactions, eventId);
  }, [availableTickets, transactions, selectedTicket?.eventId]);

  const applyTicketPricing = useCallback(
    (ticket: (typeof availableTickets)[number], qty: number, options?: { resetCurrency?: boolean }) => {
      const clampedQty = Math.max(1, Math.min(qty, getTicketAvailableQuantity(ticket, transactions)));
      form.setValue("soldQuantity", clampedQty);
      if (ticket.targetSalePrice) {
        form.setValue("negotiatedPrice", ticket.targetSalePrice * clampedQty);
        if (options?.resetCurrency !== false) {
          form.setValue("currency", ticket.saleCurrency);
        }
      }
    },
    [form, transactions]
  );

  const refreshInvoiceFromSale = useCallback(() => {
    const newClient =
      createNewClient && form.getValues("newClientFirstName") && form.getValues("newClientLastName")
        ? {
            firstName: form.getValues("newClientFirstName") ?? "",
            lastName: form.getValues("newClientLastName") ?? "",
            phone: form.getValues("newClientPhone") ?? undefined,
          }
        : undefined;

    const defaults = buildDefaultInvoice({
      existingInvoiceCount: invoiceCount,
      client: selectedClient,
      clientPhone: createNewClient ? newClientPhone : selectedClient?.phone,
      newClient,
      ticket: selectedTicket,
      soldQuantity: Number(soldQuantity) || 1,
      negotiatedPrice: Number(negotiatedPrice) || 0,
      currency,
      paymentStatus,
    });

    form.setValue("invoice", defaults);
  }, [
    createNewClient,
    currency,
    form,
    invoiceCount,
    negotiatedPrice,
    newClientPhone,
    paymentStatus,
    soldQuantity,
    selectedClient,
    selectedTicket,
  ]);

  useEffect(() => {
    if (activeDialog !== "sale") return;

    setActiveTab("sale");
    if (dialogContext.ticketId) {
      form.setValue("ticketId", dialogContext.ticketId);
      const ticket = availableTickets.find((t) => t.id === dialogContext.ticketId);
      const qty = dialogContext.soldQuantity ?? 1;
      if (ticket) applyTicketPricing(ticket, qty, { resetCurrency: true });
    }
  }, [
    activeDialog,
    dialogContext.ticketId,
    dialogContext.soldQuantity,
    availableTickets,
    applyTicketPricing,
    form,
  ]);

  useEffect(() => {
    if (activeDialog !== "sale") return;
    refreshInvoiceFromSale();
  }, [
    activeDialog,
    selectedClientId,
    createNewClient,
    newClientPhone,
    currency,
    negotiatedPrice,
    soldQuantity,
    paymentStatus,
    selectedTicketId,
    refreshInvoiceFromSale,
  ]);

  useEffect(() => {
    if (selectedTicket && soldQuantity > availableQty && availableQty > 0) {
      form.setValue("soldQuantity", availableQty);
    }
  }, [availableQty, form, selectedTicket, soldQuantity]);

  const commissionRate = form.watch("businessBringerCommissionRate");
  const commissionAmount =
    businessBringerId && negotiatedPrice && commissionRate != null
      ? (Number(negotiatedPrice) * Number(commissionRate)) / 100
      : 0;

  const onSubmit = form.handleSubmit((data) => {
    try {
      addSale(data);
      form.reset();
      setActiveTab("sale");
      closeDialog();
    } catch (error) {
      form.setError("soldQuantity", {
        message: error instanceof Error ? error.message : "Stock insuffisant",
      });
    }
  });

  const goToInvoiceTab = () => {
    refreshInvoiceFromSale();
    setActiveTab("invoice");
  };

  return (
    <Dialog open={activeDialog === "sale"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent
        className={cn(
          "sm:max-w-[560px]",
          activeTab === "invoice" && "sm:max-w-[920px]"
        )}
      >
        <DialogHeader>
          <DialogTitle>Nouvelle vente</DialogTitle>
          <DialogDescription>
            Enregistrer une vente et éditer la facture associée.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("sale")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
              activeTab === "sale"
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            Vente
          </button>
          <button
            type="button"
            onClick={goToInvoiceTab}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
              activeTab === "invoice"
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Facture
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {activeTab === "sale" ? (
            <>
              {stockByType.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {stockByType.map((group) => (
                    <div
                      key={group.ticketType}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {TICKET_TYPE_LABELS[group.ticketType]}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {group.available}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}/ {group.total}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <FormField label="Billet en stock" error={form.formState.errors.ticketId?.message} required>
                <Select
                  value={form.watch("ticketId")}
                  onValueChange={(v) => {
                    form.setValue("ticketId", v);
                    const t = availableTickets.find((x) => x.id === v);
                    if (t) applyTicketPricing(t, 1, { resetCurrency: true });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Sélectionner un billet..." /></SelectTrigger>
                  <SelectContent>
                    {availableTickets.map((t) => {
                      const avail = getTicketAvailableQuantity(t, transactions);
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          {t.event?.name} — {t.section} {t.seats} · {TICKET_TYPE_LABELS[t.ticketType]} · {avail} dispo
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormField>

              {selectedTicket && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                  <p className="font-medium">{selectedTicket.event?.name}</p>
                  <p className="text-muted-foreground">
                    {TICKET_TYPE_LABELS[selectedTicket.ticketType]} · Stock :{" "}
                    <span className="font-medium text-emerald-600">{availableQty} disponible{availableQty > 1 ? "s" : ""}</span>
                    {" "}sur {selectedTicket.quantity}
                  </p>
                  <p className="text-muted-foreground">
                    Achat : {formatCurrency(selectedTicket.purchaseUnitPrice, selectedTicket.purchaseCurrency)} / billet
                    {selectedTicket.targetSalePrice && (
                      <> · Cible : {formatCurrency(selectedTicket.targetSalePrice, selectedTicket.saleCurrency)} / billet</>
                    )}
                    {selectedTicket.minimumSalePrice && (
                      <> · Min. : {formatCurrency(selectedTicket.minimumSalePrice, selectedTicket.saleCurrency)} / billet</>
                    )}
                  </p>
                  {selectedTicket.seatsPending && (
                    <p className="mt-2 text-amber-700">
                      Places non attribuées — la vente sera enregistrée avec « Places à confirmer » sur la facture.
                    </p>
                  )}
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

              <FormRow>
                <FormField label="Apporteur d'affaires">
                  <Select
                    value={businessBringerId || "__none__"}
                    onValueChange={(v) => {
                      if (v === "__none__") {
                        form.setValue("businessBringerId", undefined);
                        form.setValue("businessBringerCommissionRate", undefined);
                        return;
                      }
                      form.setValue("businessBringerId", v);
                      const bringer = activeBringers.find((b) => b.id === v);
                      if (bringer) {
                        form.setValue("businessBringerCommissionRate", bringer.commissionRate);
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun</SelectItem>
                      {activeBringers.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.firstName} {b.lastName}
                          {b.company ? ` — ${b.company}` : ""}
                          <span className="text-muted-foreground"> (indic. {b.commissionRate}%)</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Vendeur">
                  <Select
                    value={form.watch("sellerId") || "__none__"}
                    onValueChange={(v) =>
                      form.setValue("sellerId", v === "__none__" ? undefined : v)
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun</SelectItem>
                      {activeSellers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                          {s.role ? ` — ${s.role}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormRow>

              {businessBringerId && (
                <FormRow>
                  <FormField
                    label="Commission apporteur (%)"
                    error={form.formState.errors.businessBringerCommissionRate?.message}
                    required
                  >
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      {...form.register("businessBringerCommissionRate")}
                    />
                  </FormField>
                  <div className="flex flex-col justify-end rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Montant commission
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(commissionAmount, currency)}
                    </p>
                    {selectedBringer &&
                      commissionRate !== selectedBringer.commissionRate && (
                        <p className="text-[10px] text-muted-foreground">
                          Taux indicatif : {selectedBringer.commissionRate}%
                        </p>
                      )}
                  </div>
                </FormRow>
              )}

              <FormRow cols={3}>
                <FormField
                  label="Quantité"
                  error={form.formState.errors.soldQuantity?.message}
                  required
                >
                  <Input
                    type="number"
                    min={1}
                    max={availableQty || 1}
                    {...form.register("soldQuantity", {
                      onChange: (e) => {
                        const qty = Number(e.target.value) || 1;
                        if (selectedTicket) {
                          applyTicketPricing(selectedTicket, qty, { resetCurrency: false });
                        }
                      },
                    })}
                  />
                </FormField>
                <FormField label="Prix négocié" error={form.formState.errors.negotiatedPrice?.message} required>
                  <Input type="number" min={0} step={0.01} {...form.register("negotiatedPrice")} />
                </FormField>
                <FormField label="Devise">
                  <Select
                    value={form.watch("currency")}
                    onValueChange={(v) => {
                      form.setValue("currency", v as SaleFormValues["currency"]);
                      exchangeRate.resetToLive();
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

              <ExchangeRateField
                currency={currency}
                rate={exchangeRate.rate}
                manual={exchangeRate.manual}
                loading={exchangeRate.loading}
                fetchedAt={exchangeRate.fetchedAt}
                source={exchangeRate.source}
                amount={Number(negotiatedPrice) || 0}
                onRateChange={(value) => {
                  exchangeRate.setManualRate(value);
                  form.setValue("exchangeRateToEur", value);
                }}
                onManualChange={(checked) => {
                  if (checked) {
                    exchangeRate.setManualRate(form.getValues("exchangeRateToEur"));
                  } else {
                    exchangeRate.resetToLive();
                    void exchangeRate.refresh();
                  }
                }}
                onRefresh={() => void exchangeRate.refresh()}
              />

              <FormRow cols={3}>
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
                    </SelectContent>
                  </Select>
                </FormField>
              </FormRow>

              <FormField label="Notes vente">
                <Textarea {...form.register("notes")} rows={2} placeholder="Prix négocié, conditions..." />
              </FormField>

              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <input
                  type="checkbox"
                  id="invoiceEnabled"
                  checked={invoiceEnabled}
                  onChange={(e) => form.setValue("invoice.enabled", e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="invoiceEnabled" className="text-sm">
                  Générer une facture pour cette vente
                </label>
              </div>
            </>
          ) : (
            <InvoiceEditor form={form} currency={currency} onRefresh={refreshInvoiceFromSale} />
          )}

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            {activeTab === "sale" && invoiceEnabled ? (
              <Button type="button" variant="secondary" onClick={goToInvoiceTab}>
                Continuer vers la facture
              </Button>
            ) : null}
            <Button type="submit">
              {invoiceEnabled ? "Enregistrer vente + facture" : "Enregistrer la vente"}
            </Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
