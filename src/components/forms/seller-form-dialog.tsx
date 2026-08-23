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
import { sellerFormSchema, type SellerFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";

export function SellerFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addSeller = useCrmStore((s) => s.addSeller);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "Commercial",
      status: "ACTIVE",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addSeller(data);
    form.reset();
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "seller"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nouveau vendeur</DialogTitle>
          <DialogDescription>Ajouter un membre de l&apos;équipe commerciale KLNA.</DialogDescription>
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
            <FormField label="Rôle">
              <Input {...form.register("role")} placeholder="Commercial, Senior..." />
            </FormField>
            <FormField label="Statut">
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as SellerFormValues["status"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
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
