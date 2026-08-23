"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
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
import { ticketFormSchema, type TicketFormValues } from "@/lib/validations/crm";
import { getEventCategoryOptions } from "@/lib/ticket-stock";
import { useCrmStore } from "@/stores/crm-store";
import { TICKET_TYPE_LABELS } from "@/types";

const NEW_CATEGORY_VALUE = "__new__";

const defaultFormValues: TicketFormValues = {
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
  purchaseExchangeRateToEur: 1,
  purchaseDate: new Date().toISOString().slice(0, 10),
  targetSalePrice: undefined,
  minimumSalePrice: undefined,
  saleCurrency: "EUR",
  stockStatus: "IN_STOCK",
  transferStatus: "IN_STOCK",
  seatsPending: false,
  notes: "",
};

export function TicketFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addTicket = useCrmStore((s) => s.addTicket);
  const events = useCrmStore((s) => s.events);
  const suppliers = useCrmStore((s) => s.suppliers);
  const allTickets = useCrmStore((s) => s.tickets);

  const [categorySelection, setCategorySelection] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: defaultFormValues,
  });

  const eventId = form.watch("eventId");
  const eventCategories = useMemo(
    () => (eventId ? getEventCategoryOptions(allTickets, eventId) : []),
    [allTickets, eventId]
  );
  const isNewCategory = eventCategories.length === 0 || categorySelection === NEW_CATEGORY_VALUE;
  const selectedCategory = eventCategories.find((c) => c.key === categorySelection);
  const seatsPending = form.watch("seatsPending");
  const purchaseCurrency = form.watch("purchaseCurrency");
  const purchaseUnitPrice = Number(form.watch("purchaseUnitPrice")) || 0;
  const purchaseFees = Number(form.watch("purchaseFees")) || 0;
  const quantity = Number(form.watch("quantity")) || 1;
  const purchaseExchange = useExchangeRate(purchaseCurrency);

  useEffect(() => {
    if (!purchaseExchange.manual) {
      form.setValue("purchaseExchangeRateToEur", purchaseExchange.rate);
    }
  }, [form, purchaseExchange.manual, purchaseExchange.rate]);

  useEffect(() => {
    if (activeDialog !== "ticket") return;

    form.reset({
      ...defaultFormValues,
      eventId: dialogContext.eventId ?? "",
      purchaseDate: new Date().toISOString().slice(0, 10),
    });
    setCategorySelection("");
    setCategoryError(null);
  }, [activeDialog, dialogContext.eventId, form]);

  useEffect(() => {
    if (!eventId) {
      setCategorySelection("");
      form.setValue("section", "");
      form.setValue("category", "");
      return;
    }

    if (eventCategories.length === 0) {
      setCategorySelection(NEW_CATEGORY_VALUE);
      return;
    }

    if (
      categorySelection &&
      categorySelection !== NEW_CATEGORY_VALUE &&
      !eventCategories.some((c) => c.key === categorySelection)
    ) {
      setCategorySelection("");
      form.setValue("section", "");
      form.setValue("category", "");
    }
  }, [eventId, eventCategories, categorySelection, form]);

  const lockedEventId = dialogContext.eventId;
  const selectedEvent = events.find((e) => e.id === eventId);

  const handleCategoryChange = (value: string) => {
    setCategorySelection(value);
    setCategoryError(null);

    if (value === NEW_CATEGORY_VALUE) {
      form.setValue("section", "");
      form.setValue("category", "");
      return;
    }

    const option = eventCategories.find((c) => c.key === value);
    if (option) {
      form.setValue("section", option.section);
      form.setValue("category", option.category);
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    if (eventCategories.length > 0 && !categorySelection) {
      setCategoryError("Sélectionnez une catégorie ou créez-en une nouvelle");
      return;
    }

    if (isNewCategory && !data.category?.trim()) {
      setCategoryError("Indiquez le nom de la catégorie");
      return;
    }

    addTicket(data);
    form.reset(defaultFormValues);
    setCategorySelection("");
    setCategoryError(null);
    closeDialog();
  });

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
          {lockedEventId && selectedEvent ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Événement</p>
              <p className="text-sm font-medium">{selectedEvent.name}</p>
            </div>
          ) : (
            <FormField label="Événement" error={form.formState.errors.eventId?.message} required>
              <Select
                value={eventId}
                onValueChange={(v) => {
                  form.setValue("eventId", v);
                  setCategorySelection("");
                  setCategoryError(null);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {events.filter((e) => e.status === "UPCOMING").map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormRow>
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

          {eventId ? (
            <div className="space-y-3">
              {eventCategories.length > 0 ? (
                <FormField
                  label="Catégorie"
                  error={categoryError ?? undefined}
                  required
                >
                  <Select value={categorySelection} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_CATEGORY_VALUE}>+ Nouvelle catégorie...</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              ) : null}

              {isNewCategory ? (
                <FormRow cols={2}>
                  <FormField label="Section">
                    <Input {...form.register("section")} placeholder="Pelouse Or, Tribune Nord..." />
                  </FormField>
                  <FormField
                    label="Nom de catégorie"
                    error={categoryError ?? undefined}
                    required
                  >
                    <Input
                      {...form.register("category", {
                        onChange: () => setCategoryError(null),
                      })}
                      placeholder="Gold, Cat 1..."
                    />
                  </FormField>
                </FormRow>
              ) : selectedCategory ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Catégorie sélectionnée</p>
                  <p className="text-sm font-medium">{selectedCategory.label}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sélectionnez un événement pour choisir ou créer une catégorie.
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border"
              checked={seatsPending}
              onChange={(e) => {
                const checked = e.target.checked;
                form.setValue("seatsPending", checked);
                if (checked) {
                  form.setValue("row", "");
                  form.setValue("seats", "");
                }
              }}
            />
            <span>
              <span className="text-sm font-medium">Places à attribuer plus tard</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Achat en gros — vous connaissez la catégorie mais pas encore les places exactes. Vous pourrez vendre et facturer dès maintenant.
              </span>
            </span>
          </label>

          {!seatsPending && (
            <FormRow cols={2}>
              <FormField label="Rang">
                <Input {...form.register("row")} placeholder="12, A..." />
              </FormField>
              <FormField label="Sièges">
                <Input {...form.register("seats")} placeholder="12-14" />
              </FormField>
            </FormRow>
          )}

          <FormRow cols={3}>
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

          <FormRow cols={2}>
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
            <ExchangeRateField
              currency={purchaseCurrency}
              rate={purchaseExchange.rate}
              manual={purchaseExchange.manual}
              loading={purchaseExchange.loading}
              fetchedAt={purchaseExchange.fetchedAt}
              source={purchaseExchange.source}
              amount={purchaseUnitPrice * quantity + purchaseFees}
              onRateChange={(value) => {
                purchaseExchange.setManualRate(value);
                form.setValue("purchaseExchangeRateToEur", value);
              }}
              onManualChange={(checked) => {
                if (checked) {
                  purchaseExchange.setManualRate(form.getValues("purchaseExchangeRateToEur"));
                } else {
                  purchaseExchange.resetToLive();
                  void purchaseExchange.refresh();
                }
              }}
              onRefresh={() => void purchaseExchange.refresh()}
            />
            <FormField label="Date d'achat" required>
              <Input type="date" {...form.register("purchaseDate")} />
            </FormField>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financials — Vente cible</p>
            <FormRow>
              <FormField
                label="Prix minimum (unitaire)"
                error={form.formState.errors.minimumSalePrice?.message}
              >
                <Input type="number" min={0} step={0.01} {...form.register("minimumSalePrice")} />
              </FormField>
              <FormField label="Prix de vente cible (unitaire)">
                <Input type="number" min={0} step={0.01} {...form.register("targetSalePrice")} />
              </FormField>
            </FormRow>
            <FormRow>
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
