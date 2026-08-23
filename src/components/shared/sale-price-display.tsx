import { formatCurrency } from "@/lib/currency";
import { getTransactionAmountEur } from "@/lib/exchange-rates";
import type { Transaction } from "@/types";

interface SalePriceDisplayProps {
  transaction: Transaction;
  className?: string;
  size?: "sm" | "md";
}

export function SalePriceDisplay({
  transaction,
  className,
  size = "md",
}: SalePriceDisplayProps) {
  const mainClass =
    size === "sm"
      ? "font-mono text-sm font-semibold tabular-nums"
      : "font-mono text-sm font-semibold tabular-nums";

  return (
    <div className={className ?? "text-right"}>
      <p className={mainClass}>{formatCurrency(transaction.negotiatedPrice, transaction.currency)}</p>
      {transaction.currency !== "EUR" && (
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {formatCurrency(getTransactionAmountEur(transaction), "EUR")}
        </p>
      )}
    </div>
  );
}
