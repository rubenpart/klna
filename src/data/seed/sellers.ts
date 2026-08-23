import { SEED_IDS, SEED_TIMESTAMPS } from "./ids";
import type { SeedSeller } from "./types";

const { createdAt, updatedAt } = SEED_TIMESTAMPS;
const S = SEED_IDS.sellers;

export const seedSellers: SeedSeller[] = [
  {
    id: S.nadiaKhelifi,
    firstName: "Nadia",
    lastName: "Khelifi",
    email: "nadia.k@klna-conciergerie.fr",
    phone: "+33 6 22 33 44 55",
    role: "Senior",
    status: "ACTIVE",
    notes: "Spécialiste concerts & VIP",
    createdAt,
    updatedAt,
  },
  {
    id: S.thomasLeroy,
    firstName: "Thomas",
    lastName: "Leroy",
    email: "thomas.l@klna-conciergerie.fr",
    phone: "+33 6 11 22 33 00",
    role: "Commercial",
    status: "ACTIVE",
    notes: "Sport & événements live",
    createdAt,
    updatedAt,
  },
  {
    id: S.camilleRoux,
    firstName: "Camille",
    lastName: "Roux",
    email: "camille.r@klna-conciergerie.fr",
    phone: "+33 6 44 55 66 77",
    role: "Senior",
    status: "ACTIVE",
    notes: null,
    createdAt,
    updatedAt,
  },
  {
    id: S.antoineBernard,
    firstName: "Antoine",
    lastName: "Bernard",
    email: "antoine.b@klna-conciergerie.fr",
    phone: "+33 6 88 77 66 55",
    role: "Junior",
    status: "ACTIVE",
    notes: "Formation en cours",
    createdAt,
    updatedAt,
  },
  {
    id: S.sarahDupont,
    firstName: "Sarah",
    lastName: "Dupont",
    email: "sarah.d@klna-conciergerie.fr",
    phone: "+33 6 77 66 55 44",
    role: "Commercial",
    status: "INACTIVE",
    notes: "Départ février 2026",
    createdAt,
    updatedAt,
  },
];
