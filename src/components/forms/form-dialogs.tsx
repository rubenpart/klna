import { ClientFormDialog } from "./client-form-dialog";
import { EventFormDialog } from "./event-form-dialog";
import { SaleFormDialog } from "./sale-form-dialog";
import { TicketFormDialog } from "./ticket-form-dialog";

export function FormDialogs() {
  return (
    <>
      <EventFormDialog />
      <ClientFormDialog />
      <TicketFormDialog />
      <SaleFormDialog />
    </>
  );
}
