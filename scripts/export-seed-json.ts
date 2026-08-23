/**
 * Exporte SEED_DATABASE en JSON — importable dans Supabase SQL Editor
 * ou via l'API Supabase sans passer par Prisma.
 *
 * Usage: npm run seed:export
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { amountToEur, FALLBACK_EXCHANGE_RATES_TO_EUR } from "../src/lib/exchange-rates";
import { SEED_DATABASE, getSeedStats } from "../src/data/seed";

const outDir = join(__dirname, "../src/data/seed");
const outFile = join(outDir, "seed.json");

mkdirSync(outDir, { recursive: true });

const exportable = {
  ...SEED_DATABASE,
  events: SEED_DATABASE.events.map(({ demoOffsetHours: _, ...e }) => e),
  tickets: SEED_DATABASE.tickets.map((ticket) => {
    const rate =
      ticket.purchaseExchangeRateToEur ??
      FALLBACK_EXCHANGE_RATES_TO_EUR[ticket.purchaseCurrency];
    return {
      ...ticket,
      purchaseExchangeRateToEur: rate,
      purchaseUnitPriceEur:
        ticket.purchaseUnitPriceEur ?? amountToEur(ticket.purchaseUnitPrice, rate),
      purchaseFeesEur: ticket.purchaseFeesEur ?? amountToEur(ticket.purchaseFees, rate),
    };
  }),
  transactions: SEED_DATABASE.transactions.map((transaction) => {
    const rate =
      transaction.exchangeRateToEur ?? FALLBACK_EXCHANGE_RATES_TO_EUR[transaction.currency];
    return {
      ...transaction,
      exchangeRateToEur: rate,
      negotiatedPriceEur:
        transaction.negotiatedPriceEur ?? amountToEur(transaction.negotiatedPrice, rate),
    };
  }),
};

writeFileSync(outFile, JSON.stringify(exportable, null, 2), "utf-8");

const stats = getSeedStats();
console.log("📦 Exported seed.json:");
console.log(stats);
console.log(`\n→ ${outFile}`);
