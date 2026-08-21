import type {
  AcquisitionChannel,
  AttachmentType,
  ClientType,
  Currency,
  DeliveryStatus,
  EventCategory,
  EventStatus,
  PaymentMethod,
  PaymentStatus,
  ResalePlatform,
  TicketStockStatus,
  TicketType,
  TransferStatus,
} from "@/types";

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
  ticketType: TicketType;
  quantity: number;
  purchaseUnitPrice: number;
  purchaseFees: number;
  purchaseCurrency: Currency;
  purchaseDate: string;
  stockStatus: TicketStockStatus;
  transferStatus: TransferStatus;
  targetSalePrice: number | null;
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
  saleDate: string;
  negotiatedPrice: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  deliveryStatus: DeliveryStatus;
  resalePlatform: ResalePlatform | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Bundle complet — ordre d'insertion Supabase / Prisma seed */
export interface SeedDatabase {
  events: SeedEvent[];
  suppliers: SeedSupplier[];
  clients: SeedClient[];
  ticketBatches: SeedTicketBatch[];
  tickets: SeedTicket[];
  ticketAttachments: SeedTicketAttachment[];
  transactions: SeedTransaction[];
}
