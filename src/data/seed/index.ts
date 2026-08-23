import { seedBusinessBringers } from "./business-bringers";
import { seedClients } from "./clients";
import { seedEvents } from "./events";
import { seedSellers } from "./sellers";
import { seedSuppliers } from "./suppliers";
import { seedTicketAttachments } from "./attachments";
import { seedTicketBatches } from "./ticket-batches";
import { seedTickets } from "./tickets";
import { seedTransactions } from "./transactions";
import { generateBulkSeed } from "./bulk-data";
import type { SeedDatabase } from "./types";

const bulk = generateBulkSeed(
  seedEvents.map((e) => e.id),
  seedSuppliers.map((s) => s.id),
  seedClients.map((c) => c.id),
  seedTickets.map((t) => t.id),
  seedBusinessBringers.map((b) => b.id),
  seedSellers.map((s) => s.id)
);

/**
 * Source de vérité — données plates alignées sur le schéma Prisma.
 * Core (8 evt, 8 cli…) + bulk (~30 evt, ~25 cli, ~50 tkt, ~35 txn).
 */
export const SEED_DATABASE: SeedDatabase = {
  events: [...seedEvents, ...bulk.events],
  suppliers: [...seedSuppliers, ...bulk.suppliers],
  clients: [...seedClients, ...bulk.clients],
  businessBringers: [...seedBusinessBringers, ...bulk.businessBringers],
  sellers: [...seedSellers, ...bulk.sellers],
  ticketBatches: [...seedTicketBatches, ...bulk.ticketBatches],
  tickets: [...seedTickets, ...bulk.tickets],
  ticketAttachments: [...seedTicketAttachments, ...bulk.ticketAttachments],
  transactions: [...seedTransactions, ...bulk.transactions],
};

export { SEED_IDS, SEED_TIMESTAMPS } from "./ids";
export * from "./types";
export { seedEvents } from "./events";
export { seedSuppliers } from "./suppliers";
export { seedClients } from "./clients";
export { seedTicketBatches } from "./ticket-batches";
export { seedTickets } from "./tickets";
export { seedTicketAttachments } from "./attachments";
export { seedTransactions } from "./transactions";

/** Ordre d'insertion respectant les contraintes FK */
export const SEED_INSERT_ORDER = [
  "events",
  "suppliers",
  "clients",
  "businessBringers",
  "sellers",
  "ticketBatches",
  "tickets",
  "ticketAttachments",
  "transactions",
] as const satisfies readonly (keyof SeedDatabase)[];

export function getSeedStats() {
  return {
    events: SEED_DATABASE.events.length,
    suppliers: SEED_DATABASE.suppliers.length,
    clients: SEED_DATABASE.clients.length,
    businessBringers: SEED_DATABASE.businessBringers.length,
    sellers: SEED_DATABASE.sellers.length,
    ticketBatches: SEED_DATABASE.ticketBatches.length,
    tickets: SEED_DATABASE.tickets.length,
    ticketAttachments: SEED_DATABASE.ticketAttachments.length,
    transactions: SEED_DATABASE.transactions.length,
  };
}
