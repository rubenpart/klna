"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { clientFormSchema, type ClientFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";

export function ClientFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addClient = useCrmStore((s) => s.addClient);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      acquisitionChannel: "WHATSAPP",
      clientType: "REGULAR",
      creditBalance: 0,
      creditCurrency: "EUR",
      seatPreferences: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addClient(data);
    form.reset();
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "client"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nouveau Client</DialogTitle>
          <DialogDescription>Ajouter un contact au fichier CRM.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormRow>
            <FormField label="Prénom" error={form.formState.errors.firstName?.message} required>
              <Input {...form.register("firstName")} />
            </FormField>
            <FormField label="Nom" error={form.formState.errors.lastName?.message} required>
              <Input {...form.register("lastName")} />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </FormField>
            <FormField label="Téléphone">
              <Input {...form.register("phone")} placeholder="+33 6 12 34 56 78" />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Type client">
              <Select
                value={form.watch("clientType")}
                onValueChange={(v) => form.setValue("clientType", v as ClientFormValues["clientType"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="REGULAR">Régulier</SelectItem>
                  <SelectItem value="BROKER">Broker</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Canal d'acquisition">
              <Select
                value={form.watch("acquisitionChannel")}
                onValueChange={(v) =>
                  form.setValue("acquisitionChannel", v as ClientFormValues["acquisitionChannel"])
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="WORD_OF_MOUTH">Bouche à oreille</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Crédit / Solde">
              <Input type="number" min={0} step={0.01} {...form.register("creditBalance")} />
            </FormField>
            <FormField label="Devise crédit">
              <Select
                value={form.watch("creditCurrency")}
                onValueChange={(v) => form.setValue("creditCurrency", v as ClientFormValues["creditCurrency"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormField label="Préférences placement">
            <Input {...form.register("seatPreferences")} placeholder="Rangée 1-5, Catégorie Gold..." />
          </FormField>

          <FormField label="Notes">
            <Textarea {...form.register("notes")} rows={2} />
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button type="submit">Créer le client</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
