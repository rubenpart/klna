import { SEED_IDS, SEED_TIMESTAMPS } from "./ids";
import type { SeedSupplier } from "./types";

const { createdAt, updatedAt } = SEED_TIMESTAMPS;
const S = SEED_IDS.suppliers;

export const seedSuppliers: SeedSupplier[] = [
  {
    id: S.ticketmasterPro,
    name: "TicketMaster Pro",
    alias: "TM-Pro",
    reliability: 5,
    contactChannel: "WhatsApp",
    contactInfo: "+33 6 11 22 33 44",
    internalNotes: "Fournisseur principal France — délais courts",
    createdAt,
    updatedAt,
  },
  {
    id: S.euroBroker88,
    name: "EuroBroker88",
    alias: "EB88",
    reliability: 4,
    contactChannel: "Telegram",
    contactInfo: "@eurobroker88",
    internalNotes: "Bon pour concerts stadium, parfois retard livraison",
    createdAt,
    updatedAt,
  },
  {
    id: S.dubaiVip,
    name: "Dubai VIP Tickets",
    alias: null,
    reliability: 3,
    contactChannel: "Email",
    contactInfo: "vip@dubaitix.ae",
    internalNotes: "Spécialiste F1 / événements Gulf — paiement AED",
    createdAt,
    updatedAt,
  },
  {
    id: S.parisEvents,
    name: "Paris Events Direct",
    alias: "PED",
    reliability: 4,
    contactChannel: "WhatsApp",
    contactInfo: "+33 6 55 66 77 88",
    internalNotes: "Théâtre & spectacles parisiens",
    createdAt,
    updatedAt,
  },
  {
    id: S.ukTixSource,
    name: "UK Tix Source",
    alias: "UKTS",
    reliability: 4,
    contactChannel: "Instagram",
    contactInfo: "@uktixsource",
    internalNotes: "Festivals UK/US — facturation GBP/USD",
    createdAt,
    updatedAt,
  },
];
