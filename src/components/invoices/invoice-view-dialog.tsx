"use client";

import { Printer, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { useCrmStore } from "@/stores/crm-store";

export function InvoiceViewDialog() {
  const activeDialog = useCrmStore((s) => s.activeDialog);
  const dialogContext = useCrmStore((s) => s.dialogContext);
  const closeDialog = useCrmStore((s) => s.closeDialog);
  const openDialog = useCrmStore((s) => s.openDialog);
  const transactions = useCrmStore((s) => s.transactions);

  const transaction = transactions.find((t) => t.id === dialogContext.transactionId);

  const handlePrint = () => {
    const content = document.getElementById("invoice-print-area");
    if (!content || !transaction?.invoice) return;

    const printWindow = window.open("", "_blank", "width=900,height=1100");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Facture ${transaction.invoice.number}</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 24px; color: #18181b; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={activeDialog === "invoice"} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Facture {transaction?.invoice?.number ?? ""}</DialogTitle>
          <DialogDescription>
            {transaction?.client?.firstName} {transaction?.client?.lastName} —{" "}
            {transaction?.ticket?.event?.name}
          </DialogDescription>
        </DialogHeader>

        {transaction?.invoice ? (
          <div className="space-y-4">
            <InvoicePreview
              id="invoice-print-area"
              invoice={transaction.invoice}
              currency={transaction.currency}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() =>
                  openDialog("editInvoice", { transactionId: transaction.id })
                }
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button type="button" className="gap-1.5" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimer / PDF
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune facture associée à cette vente.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
