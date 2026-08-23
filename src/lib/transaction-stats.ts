import { calculateMargin } from "@/lib/margin";
import {
  amountToEur,
  getTicketPurchaseFeesEur,
  getTicketPurchaseUnitEur,
  getTransactionAmountEur,
} from "@/lib/exchange-rates";
import type { BusinessBringer, Ticket, Transaction } from "@/types";

export function computeTransactionMargin(transaction: Transaction, ticket?: Ticket): number {
  if (!ticket) return 0;

  const qty = transaction.soldQuantity ?? 1;
  const feeShare = ticket.purchaseFees * (qty / ticket.quantity);
  const feeShareEur = getTicketPurchaseFeesEur(ticket) * (qty / ticket.quantity);
  const resaleFeeShare = ticket.resaleFees * (qty / ticket.quantity);
  const saleTotalEur = getTransactionAmountEur(transaction);
  const unitSaleEur = saleTotalEur / qty;
  const resaleFeeShareEur =
    transaction.exchangeRateToEur != null
      ? amountToEur(resaleFeeShare, transaction.exchangeRateToEur)
      : undefined;

  return calculateMargin({
    purchaseUnitPrice: ticket.purchaseUnitPrice,
    purchaseFees: feeShare,
    quantity: qty,
    purchaseCurrency: ticket.purchaseCurrency,
    purchaseRateToEur: ticket.purchaseExchangeRateToEur,
    purchaseUnitPriceEur: getTicketPurchaseUnitEur(ticket),
    purchaseFeesEur: feeShareEur,
    saleUnitPrice: transaction.negotiatedPrice / qty,
    resaleFees: resaleFeeShare,
    saleCurrency: transaction.currency,
    saleRateToEur: transaction.exchangeRateToEur,
    saleUnitPriceEur: unitSaleEur,
    resaleFeesEur: resaleFeeShareEur,
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

export { getTransactionAmountEur };
