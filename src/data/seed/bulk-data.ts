/**
 * Données bulk générées de façon déterministe — complète le seed core.
 * IDs numérotés klna_*_NNN pour portabilité Supabase.
 */
import { SEED_TIMESTAMPS } from "./ids";
import type {
  SeedClient,
  SeedEvent,
  SeedSupplier,
  SeedTicket,
  SeedTicketAttachment,
  SeedTicketBatch,
  SeedTransaction,
} from "./types";

const { createdAt, updatedAt } = SEED_TIMESTAMPS;

const pad = (n: number, len = 3) => String(n).padStart(len, "0");
const id = (prefix: string, n: number) => `klna_${prefix}_${pad(n)}`;

// ─── Templates ───────────────────────────────────────────────────────────────

const BULK_EVENTS: Omit<SeedEvent, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Coldplay — Music of the Spheres", category: "CONCERT", venue: "Groupama Stadium", city: "Lyon", dateTime: "2026-06-12T20:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Roland-Garros — Finale Hommes", category: "SPORT", venue: "Stade Roland-Garros", city: "Paris", dateTime: "2026-06-07T15:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Philippe-Chatrier — Cat Or" },
  { name: "Beyoncé — Renaissance Tour", category: "CONCERT", venue: "Orange Vélodrome", city: "Marseille", dateTime: "2026-05-28T19:30:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "UFC 310 — Paris", category: "SPORT", venue: "Accor Arena", city: "Paris", dateTime: "2026-09-06T22:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Floor seats demandés" },
  { name: "Le Roi Lion — Comédie Musicale", category: "THEATRE", venue: "Théâtre Mogador", city: "Paris", dateTime: "2026-04-05T19:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Monaco GP — Tribune K", category: "VIP", venue: "Circuit de Monaco", city: "Monaco", dateTime: "2026-05-24T14:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Hospitality package" },
  { name: "Burning Man 2026", category: "FESTIVAL", venue: "Black Rock City", city: "Nevada", dateTime: "2026-08-30T10:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Drake — It's All A Blur", category: "CONCERT", venue: "La Défense Arena", city: "Nanterre", dateTime: "2026-03-28T20:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null, demoOffsetHours: 42 },
  { name: "France vs Angleterre — 6 Nations", category: "SPORT", venue: "Stade de France", city: "Saint-Denis", dateTime: "2026-03-14T16:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Stromae — One Man Show", category: "CONCERT", venue: "Palais 12", city: "Bruxelles", dateTime: "2026-04-18T20:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Les Misérables — Théâtre", category: "THEATRE", venue: "Théâtre du Châtelet", city: "Paris", dateTime: "2026-03-08T19:30:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Champions League Final 2026", category: "SPORT", venue: "Puskás Aréna", city: "Budapest", dateTime: "2026-05-30T20:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Neutral venue" },
  { name: "Glastonbury 2026 — Weekend", category: "FESTIVAL", venue: "Worthy Farm", city: "Pilton", dateTime: "2026-06-26T12:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Dubai World Cup — VIP Lounge", category: "VIP", venue: "Meydan Racecourse", city: "Dubai", dateTime: "2026-03-29T16:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "AED billing" },
  { name: "Ed Sheeran — Mathematics Tour", category: "CONCERT", venue: "Wembley Stadium", city: "London", dateTime: "2026-07-04T19:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "NBA Paris Game 2026", category: "SPORT", venue: "Accor Arena", city: "Paris", dateTime: "2026-01-23T20:30:00.000Z", imageUrl: null, status: "COMPLETED", notes: null },
  { name: "Rock en Seine 2026", category: "FESTIVAL", venue: "Parc de Saint-Cloud", city: "Paris", dateTime: "2026-08-28T14:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Phantom of the Opera", category: "THEATRE", venue: "Her Majesty's Theatre", city: "London", dateTime: "2026-04-25T19:30:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Stalls row A-C" },
  { name: "Lewis Capaldi — Live", category: "CONCERT", venue: "Zénith Paris", city: "Paris", dateTime: "2026-02-28T20:00:00.000Z", imageUrl: null, status: "COMPLETED", notes: null },
  { name: "Barcelona vs Real Madrid — El Clásico", category: "SPORT", venue: "Camp Nou", city: "Barcelona", dateTime: "2026-10-25T21:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: "Cat 1 latéral" },
  { name: "Ultra Music Festival Miami", category: "FESTIVAL", venue: "Bayfront Park", city: "Miami", dateTime: "2026-03-27T17:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
  { name: "Metallica — M72 World Tour", category: "CONCERT", venue: "Stade de France", city: "Saint-Denis", dateTime: "2026-05-15T19:00:00.000Z", imageUrl: null, status: "UPCOMING", notes: null },
];

const BULK_CLIENTS: Omit<SeedClient, "id" | "createdAt" | "updatedAt">[] = [
  { firstName: "Thomas", lastName: "Leroy", email: "thomas.l@email.com", phone: "+33 6 11 22 33 00", acquisitionChannel: "WHATSAPP", clientType: "REGULAR", creditBalance: 0, creditCurrency: "EUR", seatPreferences: "Sport, tribune latérale", notes: null },
  { firstName: "Nadia", lastName: "Khelifi", email: "nadia.k@email.com", phone: "+33 6 22 33 44 55", acquisitionChannel: "INSTAGRAM", clientType: "VIP", creditBalance: 350, creditCurrency: "EUR", seatPreferences: "Concerts arena, floor", notes: "Influenceuse — tarifs préférentiels" },
  { firstName: "Pierre", lastName: "Moreau", email: "pierre.m@email.com", phone: "+33 6 33 44 55 66", acquisitionChannel: "WORD_OF_MOUTH", clientType: "REGULAR", creditBalance: 0, creditCurrency: "EUR", seatPreferences: null, notes: null },
  { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@email.com", phone: "+1 555 123 4567", acquisitionChannel: "B2B", clientType: "BROKER", creditBalance: 5000, creditCurrency: "USD", seatPreferences: "US festivals, NBA, NFL", notes: "Broker NYC" },
  { firstName: "Youssef", lastName: "Hassan", email: "youssef.h@email.com", phone: "+971 55 987 6543", acquisitionChannel: "B2B", clientType: "VIP", creditBalance: 15000, creditCurrency: "AED", seatPreferences: "F1, Dubai events, VIP", notes: null },
  { firstName: "Camille", lastName: "Renard", email: "camille.r@email.com", phone: "+33 6 44 55 66 77", acquisitionChannel: "WHATSAPP", clientType: "REGULAR", creditBalance: 200, creditCurrency: "EUR", seatPreferences: "Théâtre, comédies musicales", notes: null },
  { firstName: "David", lastName: "Chen", email: "david.c@email.com", phone: "+44 7700 900456", acquisitionChannel: "OTHER", clientType: "BROKER", creditBalance: 0, creditCurrency: "EUR", seatPreferences: "Premier League, concerts UK", notes: null },
  { firstName: "Léa", lastName: "Fontaine", email: "lea.f@email.com", phone: "+33 6 55 66 77 88", acquisitionChannel: "INSTAGRAM", clientType: "VIP", creditBalance: 1200, creditCurrency: "EUR", seatPreferences: "VIP, hospitality", notes: "Cliente premium Paris" },
  { firstName: "Omar", lastName: "Diallo", email: "omar.d@email.com", phone: "+33 6 66 77 88 99", acquisitionChannel: "WHATSAPP", clientType: "REGULAR", creditBalance: 0, creditCurrency: "EUR", seatPreferences: "Rap, R&B concerts", notes: null },
  { firstName: "Isabelle", lastName: "Mercier", email: "isabelle.m@email.com", phone: "+33 6 77 88 99 00", acquisitionChannel: "WORD_OF_MOUTH", clientType: "VIP", creditBalance: 750, creditCurrency: "EUR", seatPreferences: "Tennis Roland-Garros", notes: "Abonnée RG depuis 3 ans" },
  { firstName: "Ryan", lastName: "O'Brien", email: "ryan.ob@email.com", phone: "+353 87 123 4567", acquisitionChannel: "B2B", clientType: "BROKER", creditBalance: 3000, creditCurrency: "EUR", seatPreferences: "Festivals EU", notes: "Dublin-based broker" },
  { firstName: "Amina", lastName: "Bouaziz", email: "amina.b@email.com", phone: "+33 6 88 99 00 11", acquisitionChannel: "WHATSAPP", clientType: "REGULAR", creditBalance: 0, creditCurrency: "EUR", seatPreferences: null, notes: null },
  { firstName: "Hugo", lastName: "Girard", email: "hugo.g@email.com", phone: "+33 6 99 00 11 22", acquisitionChannel: "INSTAGRAM", clientType: "REGULAR", creditBalance: 100, creditCurrency: "EUR", seatPreferences: "PSG, OM", notes: null },
  { firstName: "Elena", lastName: "Vasquez", email: "elena.v@email.com", phone: "+34 612 345 678", acquisitionChannel: "OTHER", clientType: "VIP", creditBalance: 2000, creditCurrency: "EUR", seatPreferences: "El Clásico, La Liga", notes: "Cliente Barcelone" },
  { firstName: "Maxime", lastName: "Dupont", email: "maxime.d@email.com", phone: "+33 6 00 11 22 33", acquisitionChannel: "WHATSAPP", clientType: "BROKER", creditBalance: 800, creditCurrency: "EUR", seatPreferences: "Concerts, sport", notes: "Petit broker — volume moyen" },
  { firstName: "Chloé", lastName: "Bernard", email: "chloe.b@email.com", phone: "+33 6 10 20 30 40", acquisitionChannel: "INSTAGRAM", clientType: "REGULAR", creditBalance: 0, creditCurrency: "EUR", seatPreferences: "Pop, festivals", notes: null },
  { firstName: "Khalid", lastName: "Mansour", email: "khalid.m@email.com", phone: "+971 50 555 1234", acquisitionChannel: "B2B", clientType: "BROKER", creditBalance: 25000, creditCurrency: "AED", seatPreferences: "F1, Dubai World Cup", notes: "Gros volume Gulf" },
];

const STOCK_STATUSES = ["IN_STOCK", "RESERVED", "SOLD"] as const;
const TRANSFER_STATUSES = ["PENDING_RECEIPT", "IN_STOCK", "READY_TO_SEND", "SENT_TO_CLIENT"] as const;
const PLATFORMS = ["WHATSAPP", "STUBHUB", "VIAGOGO", "DIRECT_CLIENT", "PRIVATE_SALE"] as const;
const PAYMENT_STATUSES = ["PAID", "DEPOSIT", "PENDING"] as const;
const PAYMENT_METHODS = ["BANK_TRANSFER", "CARD", "CASH", "CRYPTO"] as const;
const DELIVERY_STATUSES = ["TO_DELIVER", "DELIVERED", "TRANSFER_COMPLETED"] as const;
const TICKET_TYPES = ["E_TICKET_PDF", "MOBILE_TRANSFER", "PHYSICAL", "QR_CODE"] as const;
const CURRENCIES = ["EUR", "USD", "AED"] as const;

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

export interface BulkSeedSlice {
  events: SeedEvent[];
  suppliers: SeedSupplier[];
  clients: SeedClient[];
  ticketBatches: SeedTicketBatch[];
  tickets: SeedTicket[];
  ticketAttachments: SeedTicketAttachment[];
  transactions: SeedTransaction[];
}

export function generateBulkSeed(
  coreEventIds: string[],
  coreSupplierIds: string[],
  coreClientIds: string[],
  coreTicketIds: string[]
): BulkSeedSlice {
  const startEvt = 9;
  const events: SeedEvent[] = BULK_EVENTS.map((e, i) => ({
    ...e,
    id: id("evt", startEvt + i),
    createdAt,
    updatedAt,
  }));

  const allEventIds = [...coreEventIds, ...events.map((e) => e.id)];

  const suppliers: SeedSupplier[] = [
    { id: id("sup", 6), name: "Scalpers Anonymous", alias: "SA", reliability: 2, contactChannel: "Telegram", contactInfo: "@scalpers_anon", internalNotes: "Dernier recours — vérifier billets", createdAt, updatedAt },
    { id: id("sup", 7), name: "Gulf Events LLC", alias: "GEL", reliability: 4, contactChannel: "WhatsApp", contactInfo: "+971 4 123 4567", internalNotes: "Moyen-Orient premium", createdAt, updatedAt },
    { id: id("sup", 8), name: "LiveNation Resale FR", alias: "LNR", reliability: 5, contactChannel: "Email", contactInfo: "resale@livenation.fr", internalNotes: "Partenaire officiel", createdAt, updatedAt },
  ];

  const allSupplierIds = [...coreSupplierIds, ...suppliers.map((s) => s.id)];

  const startCli = 9;
  const clients: SeedClient[] = BULK_CLIENTS.map((c, i) => ({
    ...c,
    id: id("cli", startCli + i),
    createdAt,
    updatedAt,
  }));

  const allClientIds = [...coreClientIds, ...clients.map((c) => c.id)];

  const ticketBatches: SeedTicketBatch[] = [
    { id: id("bat", 4), supplierId: allSupplierIds[5], purchaseDate: "2026-01-18T10:00:00.000Z", totalQuantity: 6, totalPurchasePrice: 1440, totalPurchaseFees: 90, currency: "EUR", sourceName: null, notes: "Lot Coldplay — 6 billets Cat 2", createdAt, updatedAt },
    { id: id("bat", 5), supplierId: allSupplierIds[6], purchaseDate: "2026-02-03T14:00:00.000Z", totalQuantity: 4, totalPurchasePrice: 32000, totalPurchaseFees: 800, currency: "AED", sourceName: "Dubai World Cup Official", notes: "VIP Lounge x4", createdAt, updatedAt },
    { id: id("bat", 6), supplierId: allSupplierIds[7], purchaseDate: "2026-01-25T09:00:00.000Z", totalQuantity: 2, totalPurchasePrice: 680, totalPurchaseFees: 45, currency: "EUR", sourceName: null, notes: "Roland-Garros finale", createdAt, updatedAt },
    { id: id("bat", 7), supplierId: allSupplierIds[1], purchaseDate: "2026-02-08T11:00:00.000Z", totalQuantity: 8, totalPurchasePrice: 960, totalPurchaseFees: 120, currency: "EUR", sourceName: null, notes: "Metallica — 8 places fosse", createdAt, updatedAt },
    { id: id("bat", 8), supplierId: allSupplierIds[4], purchaseDate: "2026-01-30T16:00:00.000Z", totalQuantity: 2, totalPurchasePrice: 1100, totalPurchaseFees: 95, currency: "USD", sourceName: "Ultra Miami Resale", notes: null, createdAt, updatedAt },
  ];

  const tickets: SeedTicket[] = [];
  const transactions: SeedTransaction[] = [];
  const ticketAttachments: SeedTicketAttachment[] = [];

  let tktIdx = 13;
  let txnIdx = 9;
  let attIdx = 7;

  // Génère ~35 tickets supplémentaires répartis sur tous les événements
  for (let i = 0; i < 35; i++) {
    const eventId = pick(allEventIds, i + 3);
    const supplierId = pick(allSupplierIds, i);
    const stockStatus = pick(STOCK_STATUSES, i);
    const isSold = stockStatus === "SOLD";
    const currency = pick(CURRENCIES, i);
    const purchasePrice = 80 + (i % 12) * 45 + (currency === "AED" ? 2000 : currency === "USD" ? 100 : 0);
    const targetPrice = Math.round(purchasePrice * (1.35 + (i % 5) * 0.08));
    const actualPrice = isSold ? Math.round(targetPrice * (0.95 + (i % 3) * 0.05)) : null;
    const batchId = i % 7 === 0 ? pick(ticketBatches, Math.floor(i / 7)).id : null;

    const ticketId = id("tkt", tktIdx++);
    tickets.push({
      id: ticketId,
      eventId,
      batchId,
      supplierId,
      section: pick(["Tribune", "Pelouse", "VIP", "Orchestre", "Floor", "Virage", "Paddock"], i),
      category: pick(["Cat 1", "Cat 2", "Gold", "Premium", "Standard", "VIP"], i),
      row: String((i % 30) + 1),
      seats: `${(i % 20) + 1}-${(i % 20) + 2}`,
      ticketType: pick(TICKET_TYPES, i),
      quantity: i % 4 === 0 ? 2 : 1,
      purchaseUnitPrice: purchasePrice,
      purchaseFees: 10 + (i % 5) * 8,
      purchaseCurrency: currency,
      purchaseDate: `2026-0${1 + (i % 2)}-${String(5 + (i % 20)).padStart(2, "0")}T10:00:00.000Z`,
      stockStatus,
      transferStatus: isSold ? pick(["READY_TO_SEND", "SENT_TO_CLIENT"], i) : pick(TRANSFER_STATUSES, i),
      targetSalePrice: targetPrice,
      actualSalePrice: actualPrice,
      resaleFees: isSold ? Math.round((actualPrice ?? 0) * 0.05) : 0,
      resalePlatform: isSold ? pick(PLATFORMS, i) : null,
      saleCurrency: currency,
      notes: i % 6 === 0 ? "Billet vérifié — authentique" : null,
      createdAt,
      updatedAt,
    });

    if (i % 3 !== 2) {
      ticketAttachments.push({
        id: id("att", attIdx++),
        ticketId,
        type: pick(["E_TICKET_PDF", "TRANSFER_SCREENSHOT", "QR_CODE"], i),
        fileName: `ticket-${ticketId.slice(-3)}.pdf`,
        fileUrl: `/uploads/tickets/ticket-${ticketId.slice(-3)}.pdf`,
        mimeType: "application/pdf",
        createdAt,
      });
    }

    if (isSold || stockStatus === "RESERVED") {
      const clientId = pick(allClientIds, i + txnIdx);
      transactions.push({
        id: id("txn", txnIdx++),
        ticketId,
        clientId,
        saleDate: `2026-02-${String(1 + (i % 19)).padStart(2, "0")}T${String(10 + (i % 8)).padStart(2, "0")}:00:00.000Z`,
        negotiatedPrice: (actualPrice ?? targetPrice) * (i % 4 === 0 ? 2 : 1),
        currency,
        paymentStatus: pick(PAYMENT_STATUSES, i),
        paymentMethod: pick(PAYMENT_METHODS, i),
        deliveryStatus: isSold ? pick(DELIVERY_STATUSES, i) : "TO_DELIVER",
        resalePlatform: pick(PLATFORMS, i),
        notes: null,
        createdAt,
        updatedAt,
      });
    }
  }

  // Tickets manuels haute qualité pour événements bulk phares
  const featuredTickets: SeedTicket[] = [
    {
      id: id("tkt", tktIdx++),
      eventId: events[0].id, // Coldplay
      batchId: ticketBatches[0].id,
      supplierId: allSupplierIds[7],
      section: "Tribune Est", category: "Cat 2", row: "22", seats: "10-11",
      ticketType: "E_TICKET_PDF", quantity: 2,
      purchaseUnitPrice: 240, purchaseFees: 15, purchaseCurrency: "EUR",
      purchaseDate: "2026-01-18T10:00:00.000Z",
      stockStatus: "SOLD", transferStatus: "SENT_TO_CLIENT",
      targetSalePrice: 380, actualSalePrice: 395, resaleFees: 20,
      resalePlatform: "WHATSAPP", saleCurrency: "EUR", notes: null, createdAt, updatedAt,
    },
    {
      id: id("tkt", tktIdx++),
      eventId: events[1].id, // Roland-Garros
      batchId: ticketBatches[2].id,
      supplierId: allSupplierIds[7],
      section: "Philippe-Chatrier", category: "Cat Or", row: "5", seats: "14",
      ticketType: "PHYSICAL", quantity: 1,
      purchaseUnitPrice: 340, purchaseFees: 22, purchaseCurrency: "EUR",
      purchaseDate: "2026-01-25T09:00:00.000Z",
      stockStatus: "RESERVED", transferStatus: "IN_STOCK",
      targetSalePrice: 520, actualSalePrice: null, resaleFees: 0,
      resalePlatform: null, saleCurrency: "EUR", notes: "Réservé Isabelle Mercier", createdAt, updatedAt,
    },
    {
      id: id("tkt", tktIdx++),
      eventId: events[13].id, // Dubai World Cup
      batchId: ticketBatches[1].id,
      supplierId: allSupplierIds[6],
      section: "VIP Lounge", category: "VIP", row: "Suite A", seats: "1-4",
      ticketType: "QR_CODE", quantity: 4,
      purchaseUnitPrice: 8000, purchaseFees: 200, purchaseCurrency: "AED",
      purchaseDate: "2026-02-03T14:00:00.000Z",
      stockStatus: "IN_STOCK", transferStatus: "IN_STOCK",
      targetSalePrice: 12000, actualSalePrice: null, resaleFees: 600,
      resalePlatform: "DIRECT_CLIENT", saleCurrency: "AED", notes: null, createdAt, updatedAt,
    },
  ];

  tickets.push(...featuredTickets);

  transactions.push(
    {
      id: id("txn", txnIdx++),
      ticketId: featuredTickets[0].id,
      clientId: clients[3].id, // Thomas
      saleDate: "2026-02-12T14:00:00.000Z",
      negotiatedPrice: 790,
      currency: "EUR",
      paymentStatus: "PAID",
      paymentMethod: "BANK_TRANSFER",
      deliveryStatus: "TRANSFER_COMPLETED",
      resalePlatform: "WHATSAPP",
      notes: "Coldplay Lyon — très satisfait",
      createdAt,
      updatedAt,
    },
    {
      id: id("txn", txnIdx++),
      ticketId: featuredTickets[1].id,
      clientId: clients[9].id, // Isabelle
      saleDate: "2026-02-15T11:00:00.000Z",
      negotiatedPrice: 520,
      currency: "EUR",
      paymentStatus: "DEPOSIT",
      paymentMethod: "CARD",
      deliveryStatus: "TO_DELIVER",
      resalePlatform: "WHATSAPP",
      notes: "Acompte 200€ Roland-Garros",
      createdAt,
      updatedAt,
    }
  );

  return { events, suppliers, clients, ticketBatches, tickets, ticketAttachments, transactions };
}
