/**
 * IDs stables partagés entre mock UI et seed Supabase.
 * Ne pas régénérer — ces IDs sont référencés par les FK.
 */
export const SEED_IDS = {
  events: {
    psgUcl: "klna_evt_001",
    badBunny: "klna_evt_002",
    hamilton: "klna_evt_003",
    f1AbuDhabi: "klna_evt_004",
    tomorrowland: "klna_evt_005",
    taylorSwift: "klna_evt_006",
    omMarseille: "klna_evt_007",
    coachella: "klna_evt_008",
  },
  suppliers: {
    ticketmasterPro: "klna_sup_001",
    euroBroker88: "klna_sup_002",
    dubaiVip: "klna_sup_003",
    parisEvents: "klna_sup_004",
    ukTixSource: "klna_sup_005",
  },
  clients: {
    karimBenali: "klna_cli_001",
    sophieMartin: "klna_cli_002",
    ahmedAlRashid: "klna_cli_003",
    lucasDubois: "klna_cli_004",
    emmaPetit: "klna_cli_005",
    jamesWilson: "klna_cli_006",
    fatimaZahra: "klna_cli_007",
    marcoRossi: "klna_cli_008",
  },
  batches: {
    badBunnyGold4: "klna_bat_001",
    f1Paddock2: "klna_bat_002",
    coachellaWknd1: "klna_bat_003",
  },
  tickets: {
    psgBoulogne: "klna_tkt_001",
    badBunnyGoldLot: "klna_tkt_002",
    badBunnyGoldSplitA: "klna_tkt_003",
    badBunnyGoldSplitB: "klna_tkt_004",
    hamiltonOrchestre: "klna_tkt_005",
    f1Paddock: "klna_tkt_006",
    tomorrowlandComfort: "klna_tkt_007",
    psgAuteuil: "klna_tkt_008",
    badBunnyStandard: "klna_tkt_009",
    taylorSwiftFloor: "klna_tkt_010",
    omVirageSud: "klna_tkt_011",
    coachellaGA: "klna_tkt_012",
  },
  attachments: {
    psgPdf: "klna_att_001",
    badBunnyPdf: "klna_att_002",
    f1Qr: "klna_att_003",
    tomorrowlandTransfer: "klna_att_004",
    taylorTransfer: "klna_att_005",
    coachellaPdf: "klna_att_006",
  },
  transactions: {
    psgBoulogneSale: "klna_txn_001",
    tomorrowlandSale: "klna_txn_002",
    psgAuteuilSale: "klna_txn_003",
    taylorSwiftSale: "klna_txn_004",
    badBunnySplitA: "klna_txn_005",
    badBunnySplitB: "klna_txn_006",
    hamiltonReserve: "klna_txn_007",
    f1DirectSale: "klna_txn_008",
  },
} as const;

export const SEED_TIMESTAMPS = {
  base: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T08:00:00.000Z",
  updatedAt: "2026-02-20T12:00:00.000Z",
} as const;
