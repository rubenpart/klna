// ─── Enums (miroir Prisma, utilisables côté client) ─────────────────────────

export type EventCategory = "CONCERT" | "SPORT" | "THEATRE" | "VIP" | "FESTIVAL";
export type EventStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";
export type TicketType = "E_TICKET_PDF" | "MOBILE_TRANSFER" | "PHYSICAL" | "QR_CODE";
export type TicketStockStatus = "IN_STOCK" | "RESERVED" | "SOLD";
export type TransferStatus =
  | "PENDING_RECEIPT"
  | "IN_STOCK"
  | "READY_TO_SEND"
  | "SENT_TO_CLIENT";
export type ResalePlatform =
  | "STUBHUB"
  | "VIAGOGO"
  | "DIRECT_CLIENT"
  | "WHATSAPP"
  | "PRIVATE_SALE";
export type Currency = "EUR" | "USD" | "AED";
export type AcquisitionChannel =
  | "WHATSAPP"
  | "INSTAGRAM"
  | "WORD_OF_MOUTH"
  | "B2B"
  | "OTHER";
export type ClientType = "VIP" | "REGULAR" | "BROKER";
export type PaymentStatus = "PAID" | "DEPOSIT" | "PENDING";
export type PaymentMethod = "BANK_TRANSFER" | "CARD" | "CASH" | "CRYPTO";
export type DeliveryStatus = "TO_DELIVER" | "DELIVERED" | "TRANSFER_COMPLETED";
export type AttachmentType = "E_TICKET_PDF" | "TRANSFER_SCREENSHOT" | "QR_CODE" | "OTHER";
export type MarginTier = "high" | "medium" | "loss";

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  venue: string;
  city?: string;
  dateTime: string;
  imageUrl?: string;
  status: EventStatus;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  alias?: string;
  reliability: number;
  contactChannel?: string;
}

export interface TicketBatch {
  id: string;
  supplierId: string;
  purchaseDate: string;
  totalQuantity: number;
  totalPurchasePrice: number;
  totalPurchaseFees: number;
  currency: Currency;
  sourceName?: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  type: "E_TICKET_PDF" | "TRANSFER_SCREENSHOT" | "QR_CODE" | "OTHER";
  fileName: string;
  fileUrl: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  batchId?: string;
  supplierId?: string;
  section?: string;
  category?: string;
  row?: string;
  seats?: string;
  ticketType: TicketType;
  quantity: number;
  purchaseUnitPrice: number;
  purchaseFees: number;
  purchaseCurrency: Currency;
  purchaseDate: string;
  stockStatus: TicketStockStatus;
  transferStatus: TransferStatus;
  targetSalePrice?: number;
  actualSalePrice?: number;
  resaleFees: number;
  resalePlatform?: ResalePlatform;
  saleCurrency: Currency;
  notes?: string;
  // Relations enrichies pour l'UI
  event?: Event;
  supplier?: Supplier;
  attachments?: TicketAttachment[];
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  acquisitionChannel: AcquisitionChannel;
  clientType: ClientType;
  creditBalance: number;
  creditCurrency: Currency;
  seatPreferences?: string;
  totalSpent?: number;
  totalMarginGenerated?: number;
}

export interface Transaction {
  id: string;
  ticketId: string;
  clientId: string;
  saleDate: string;
  negotiatedPrice: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryStatus: DeliveryStatus;
  resalePlatform?: ResalePlatform;
  // Relations enrichies
  ticket?: Ticket;
  client?: Client;
}

export interface MarginResult {
  netMargin: number;
  marginRate: number;
  totalPurchaseEur: number;
  totalSaleEur: number;
  tier: MarginTier;
}

export interface DashboardKPIs {
  totalRevenue: number;
  monthlyRevenue: number;
  totalGrossMargin: number;
  averageMarginRate: number;
  stockInvestment: number;
  stockEstimatedValue: number;
  ticketsInStock: number;
  ticketsSold: number;
}

export interface UrgentDelivery {
  ticket: Ticket;
  event: Event;
  transaction?: Transaction;
  hoursUntilEvent: number;
  urgencyLevel: "critical" | "warning";
}

// ─── Label Maps ──────────────────────────────────────────────────────────────

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  CONCERT: "Concert",
  SPORT: "Sport",
  THEATRE: "Théâtre",
  VIP: "VIP",
  FESTIVAL: "Festival",
};

export const TICKET_STOCK_LABELS: Record<TicketStockStatus, string> = {
  IN_STOCK: "En stock",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  PENDING_RECEIPT: "En attente réception",
  IN_STOCK: "En stock",
  READY_TO_SEND: "Prêt à envoyer",
  SENT_TO_CLIENT: "Envoyé au client",
};

export const RESALE_PLATFORM_LABELS: Record<ResalePlatform, string> = {
  STUBHUB: "StubHub",
  VIAGOGO: "Viagogo",
  DIRECT_CLIENT: "Direct Client",
  WHATSAPP: "WhatsApp",
  PRIVATE_SALE: "Gré à gré",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Payé",
  DEPOSIT: "Acompte",
  PENDING: "En attente",
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  TO_DELIVER: "À livrer",
  DELIVERED: "Livré",
  TRANSFER_COMPLETED: "Transfert effectué",
};

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  E_TICKET_PDF: "E-Ticket PDF",
  MOBILE_TRANSFER: "Mobile Transfer",
  PHYSICAL: "Physique",
  QR_CODE: "QR Code",
};
