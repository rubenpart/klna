import { convertToEur } from "@/lib/currency";
import type { Currency, MarginResult, MarginTier } from "@/types";

export interface MarginInput {
  purchaseUnitPrice: number;
  purchaseFees: number;
  quantity?: number;
  purchaseCurrency: Currency;
  saleUnitPrice: number;
  resaleFees: number;
  saleCurrency: Currency;
  purchaseRateToEur?: number;
  saleRateToEur?: number;
  purchaseUnitPriceEur?: number;
  purchaseFeesEur?: number;
  saleUnitPriceEur?: number;
  resaleFeesEur?: number;
}

/**
 * Marge Nette = (Prix Vente - Frais Vente) - (Prix Achat + Frais Achat)
 * Tous les montants sont convertis en EUR pour comparaison.
 */
export function calculateMargin(input: MarginInput): MarginResult {
  const qty = input.quantity ?? 1;

  const totalPurchaseEur =
    input.purchaseUnitPriceEur != null
      ? input.purchaseUnitPriceEur * qty + (input.purchaseFeesEur ?? 0)
      : convertToEur(input.purchaseUnitPrice * qty, input.purchaseCurrency, input.purchaseRateToEur) +
        convertToEur(input.purchaseFees, input.purchaseCurrency, input.purchaseRateToEur);

  const totalSaleEur =
    input.saleUnitPriceEur != null
      ? input.saleUnitPriceEur * qty - (input.resaleFeesEur ?? 0)
      : convertToEur(input.saleUnitPrice * qty, input.saleCurrency, input.saleRateToEur) -
        convertToEur(input.resaleFees, input.saleCurrency, input.saleRateToEur);

  const netMargin = totalSaleEur - totalPurchaseEur;
  const marginRate = totalPurchaseEur > 0 ? (netMargin / totalPurchaseEur) * 100 : 0;

  return {
    netMargin,
    marginRate,
    totalPurchaseEur,
    totalSaleEur,
    tier: getMarginTier(marginRate),
  };
}

export function getMarginTier(marginRate: number): MarginTier {
  if (marginRate > 25) return "high";
  if (marginRate >= 0) return "medium";
  return "loss";
}

export function getMarginTierLabel(tier: MarginTier): string {
  switch (tier) {
    case "high":
      return "Excellente";
    case "medium":
      return "Correcte";
    case "loss":
      return "Perte";
  }
}

/** Répartit le coût d'un lot au prorata pour le split de billets */
export function prorateBatchCost(
  totalPurchasePrice: number,
  totalPurchaseFees: number,
  totalQuantity: number,
  splitQuantity: number
): { unitPrice: number; fees: number } {
  const ratio = splitQuantity / totalQuantity;
  return {
    unitPrice: (totalPurchasePrice * ratio) / splitQuantity,
    fees: totalPurchaseFees * ratio,
  };
}
