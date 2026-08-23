"use client";

import { UpdateSaleStatusDialog } from "./update-sale-status-dialog";
import { AssignSeatsDialog } from "./assign-seats-dialog";
import { BusinessBringerFormDialog } from "./business-bringer-form-dialog";
import { ClientFormDialog } from "./client-form-dialog";
import { EventFormDialog } from "./event-form-dialog";
import { SaleFormDialog } from "./sale-form-dialog";
import { SellerFormDialog } from "./seller-form-dialog";
import { TicketFormDialog } from "./ticket-form-dialog";
import { EditInvoiceDialog } from "@/components/invoices/edit-invoice-dialog";
import { InvoiceViewDialog } from "@/components/invoices/invoice-view-dialog";

export function FormDialogs() {
  return (
    <>
      <EventFormDialog />
      <ClientFormDialog />
      <BusinessBringerFormDialog />
      <SellerFormDialog />
      <TicketFormDialog />
      <SaleFormDialog />
      <AssignSeatsDialog />
      <UpdateSaleStatusDialog />
      <InvoiceViewDialog />
      <EditInvoiceDialog />
    </>
  );
}
