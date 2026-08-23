import type {
  AcquisitionChannel,
  AttachmentType,
  ClientType,
  Currency,
  DeliveryStatus,
  EventCategory,
  EventStatus,
  Invoice,
  PaymentMethod,
  PaymentStatus,
  ResalePlatform,
  TicketStockStatus,
  TicketType,
  TransferStatus,
} from "@/types";

export type PartnerStatus = "ACTIVE" | "INACTIVE";

/** Champs communs Prisma — dates en ISO string pour portabilité JSON/Supabase */
export interface SeedTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SeedEvent {
  id: string;
  name: string;
  category: EventCategory;
  venue: string;
  city: string | null;
  dateTime: string;
  imageUrl: string | null;
  status: EventStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  /** Décalage dynamique en heures pour la démo UI (alertes H-24/H-48) */
  demoOffsetHours?: number;
}

export interface SeedSupplier {
  id: string;
  name: string;
  alias: string | null;
  reliability: number;
  contactChannel: string | null;
  contactInfo: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedTicketBatch {
  id: string;
  supplierId: string;
  purchaseDate: string;
  totalQuantity: number;
  totalPurchasePrice: number;
  totalPurchaseFees: number;
  currency: Currency;
  sourceName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedTicket {
  id: string;
  eventId: string;
  batchId: string | null;
  supplierId: string | null;
  section: string | null;
  category: string | null;
  row: string | null;
  seats: string | null;
  seatsPending?: boolean;
  ticketType: TicketType;
  quantity: number;
  purchaseUnitPrice: number;
  purchaseFees: number;
  purchaseCurrency: Currency;
  purchaseDate: string;
  stockStatus: TicketStockStatus;
  transferStatus: TransferStatus;
  targetSalePrice: number | null;
  minimumSalePrice?: number | null;
  actualSalePrice: number | null;
  resaleFees: number;
  resalePlatform: ResalePlatform | null;
  saleCurrency: Currency;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedTicketAttachment {
  id: string;
  ticketId: string;
  type: AttachmentType;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  createdAt: string;
}

export interface SeedClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  acquisitionChannel: AcquisitionChannel;
  clientType: ClientType;
  creditBalance: number;
  creditCurrency: Currency;
  seatPreferences: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedTransaction {
  id: string;
  ticketId: string;
  clientId: string;
  businessBringerId?: string | null;
  businessBringerCommissionRate?: number | null;
  sellerId?: string | null;
  saleDate: string;
  negotiatedPrice: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  deliveryStatus: DeliveryStatus;
  resalePlatform: ResalePlatform | null;
  notes: string | null;
  soldQuantity?: number;
  seatsPending?: boolean;
  assignedRow?: string | null;
  assignedSeats?: string | null;
  invoice?: Invoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedBusinessBringer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  commissionRate: number;
  status: PartnerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedSeller {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  status: PartnerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Bundle complet — ordre d'insertion Supabase / Prisma seed */
export interface SeedDatabase {
  events: SeedEvent[];
  suppliers: SeedSupplier[];
  clients: SeedClient[];
  businessBringers: SeedBusinessBringer[];
  sellers: SeedSeller[];
  ticketBatches: SeedTicketBatch[];
  tickets: SeedTicket[];
  ticketAttachments: SeedTicketAttachment[];
  transactions: SeedTransaction[];
}
