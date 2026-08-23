import { calculateMargin } from "@/lib/margin";
import type { BusinessBringer, Ticket, Transaction } from "@/types";

export function computeTransactionMargin(transaction: Transaction, ticket?: Ticket): number {
  if (!ticket) return 0;

  const qty = transaction.soldQuantity ?? 1;
  const unitSale = transaction.negotiatedPrice / qty;
  const feeShare = ticket.purchaseFees * (qty / ticket.quantity);

  return calculateMargin({
    purchaseUnitPrice: ticket.purchaseUnitPrice,
    purchaseFees: feeShare,
    quantity: qty,
    purchaseCurrency: ticket.purchaseCurrency,
    saleUnitPrice: unitSale,
    resaleFees: ticket.resaleFees * (qty / ticket.quantity),
    saleCurrency: transaction.currency,
  }).netMargin;
}

export function computeBringerCommission(
  transaction: Transaction,
  bringer?: Pick<BusinessBringer, "commissionRate">
): number {
  const rate = transaction.businessBringerCommissionRate ?? bringer?.commissionRate ?? 0;
  return transaction.negotiatedPrice * (rate / 100);
}

export function sumTransactionMargins(transactions: Transaction[], tickets: Ticket[]): number {
  const ticketMap = new Map(tickets.map((t) => [t.id, t]));
  return transactions.reduce(
    (sum, txn) => sum + computeTransactionMargin(txn, ticketMap.get(txn.ticketId)),
    0
  );
}

export function sumBringerCommissions(
  transactions: Transaction[],
  bringer?: Pick<BusinessBringer, "commissionRate">
): number {
  return transactions.reduce((sum, txn) => sum + computeBringerCommission(txn, bringer), 0);
}
