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
import {
  businessBringerFormSchema,
  type BusinessBringerFormValues,
} from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";

export function BusinessBringerFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addBusinessBringer = useCrmStore((s) => s.addBusinessBringer);

  const form = useForm<BusinessBringerFormValues>({
    resolver: zodResolver(businessBringerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      commissionRate: 8,
      status: "ACTIVE",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addBusinessBringer(data);
    form.reset();
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "businessBringer"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nouvel apporteur d&apos;affaires</DialogTitle>
          <DialogDescription>Ajouter un partenaire qui apporte des clients ou des deals.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormRow>
            <FormField label="Prénom" required>
              <Input {...form.register("firstName")} />
            </FormField>
            <FormField label="Nom" required>
              <Input {...form.register("lastName")} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email">
              <Input type="email" {...form.register("email")} />
            </FormField>
            <FormField label="Téléphone">
              <Input {...form.register("phone")} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Société / réseau">
              <Input {...form.register("company")} placeholder="Optionnel" />
            </FormField>
            <FormField label="Commission par défaut (%)" required>
              <Input type="number" min={0} max={100} step={0.5} {...form.register("commissionRate")} />
            </FormField>
          </FormRow>
          <FormField label="Statut">
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as BusinessBringerFormValues["status"])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Notes">
            <Textarea {...form.register("notes")} rows={2} />
          </FormField>
          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button type="submit">Ajouter</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
