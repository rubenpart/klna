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
import { eventFormSchema, type EventFormValues } from "@/lib/validations/crm";
import { useCrmStore } from "@/stores/crm-store";
import { EVENT_CATEGORY_LABELS } from "@/types";

export function EventFormDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const addEvent = useCrmStore((s) => s.addEvent);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      category: "CONCERT",
      venue: "",
      city: "",
      dateTime: "",
      status: "UPCOMING",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    addEvent(data);
    form.reset();
    closeDialog();
  });

  return (
    <Dialog open={activeDialog === "event"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nouvel Événement</DialogTitle>
          <DialogDescription>Ajouter un événement au catalogue KLNA.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Nom de l'événement" error={form.formState.errors.name?.message} required>
            <Input {...form.register("name")} placeholder="PSG vs Real Madrid — UCL" />
          </FormField>

          <FormRow>
            <FormField label="Catégorie" required>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as EventFormValues["category"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Statut">
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as EventFormValues["status"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">À venir</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Lieu / Stade" error={form.formState.errors.venue?.message} required>
              <Input {...form.register("venue")} placeholder="Parc des Princes" />
            </FormField>
            <FormField label="Ville">
              <Input {...form.register("city")} placeholder="Paris" />
            </FormField>
          </FormRow>

          <FormField label="Date & Heure" error={form.formState.errors.dateTime?.message} required>
            <Input type="datetime-local" {...form.register("dateTime")} />
          </FormField>

          <FormField label="Notes internes">
            <Textarea {...form.register("notes")} placeholder="Infos placement, demande client..." rows={2} />
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>Créer l&apos;événement</Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
