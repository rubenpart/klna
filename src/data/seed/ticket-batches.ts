import { SEED_IDS, SEED_TIMESTAMPS } from "./ids";
import type { SeedTicketBatch } from "./types";

const { createdAt, updatedAt } = SEED_TIMESTAMPS;
const B = SEED_IDS.batches;
const S = SEED_IDS.suppliers;

export const seedTicketBatches: SeedTicketBatch[] = [
  {
    id: B.badBunnyGold4,
    supplierId: S.euroBroker88,
    purchaseDate: "2026-02-01T14:00:00.000Z",
    totalQuantity: 4,
    totalPurchasePrice: 780,
    totalPurchaseFees: 60,
    currency: "EUR",
    sourceName: null,
    notes: "Lot 4× Gold Bad Bunny — vendu en split 2+2",
    createdAt,
    updatedAt,
  },
  {
    id: B.f1Paddock2,
    supplierId: S.dubaiVip,
    purchaseDate: "2026-01-20T11:00:00.000Z",
    totalQuantity: 2,
    totalPurchasePrice: 5600,
    totalPurchaseFees: 400,
    currency: "AED",
    sourceName: null,
    notes: "Paddock Club Abu Dhabi — paire suite 7",
    createdAt,
    updatedAt,
  },
  {
    id: B.coachellaWknd1,
    supplierId: S.ukTixSource,
    purchaseDate: "2026-01-28T09:00:00.000Z",
    totalQuantity: 2,
    totalPurchasePrice: 980,
    totalPurchaseFees: 85,
    currency: "USD",
    sourceName: "Coachella Official Resale",
    notes: "GA Weekend 1 + shuttle",
    createdAt,
    updatedAt,
  },
];
