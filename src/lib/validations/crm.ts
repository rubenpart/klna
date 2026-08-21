import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  category: z.enum(["CONCERT", "SPORT", "THEATRE", "VIP", "FESTIVAL"]),
  venue: z.string().min(2, "Lieu requis"),
  city: z.string().optional(),
  dateTime: z.string().min(1, "Date requise"),
  status: z.enum(["UPCOMING", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const clientFormSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  acquisitionChannel: z.enum(["WHATSAPP", "INSTAGRAM", "WORD_OF_MOUTH", "B2B", "OTHER"]),
  clientType: z.enum(["VIP", "REGULAR", "BROKER"]),
  creditBalance: z.coerce.number().min(0),
  creditCurrency: z.enum(["EUR", "USD", "AED"]),
  seatPreferences: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const ticketFormSchema = z.object({
  eventId: z.string().min(1, "Événement requis"),
  supplierId: z.string().optional(),
  section: z.string().optional(),
  category: z.string().optional(),
  row: z.string().optional(),
  seats: z.string().optional(),
  ticketType: z.enum(["E_TICKET_PDF", "MOBILE_TRANSFER", "PHYSICAL", "QR_CODE"]),
  quantity: z.coerce.number().int().min(1, "Min. 1 billet"),
  purchaseUnitPrice: z.coerce.number().min(0, "Prix requis"),
  purchaseFees: z.coerce.number().min(0),
  purchaseCurrency: z.enum(["EUR", "USD", "AED"]),
  purchaseDate: z.string().min(1, "Date d'achat requise"),
  targetSalePrice: z.coerce.number().min(0).optional(),
  saleCurrency: z.enum(["EUR", "USD", "AED"]),
  stockStatus: z.enum(["IN_STOCK", "RESERVED", "SOLD"]),
  transferStatus: z.enum([
    "PENDING_RECEIPT",
    "IN_STOCK",
    "READY_TO_SEND",
    "SENT_TO_CLIENT",
  ]),
  notes: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const saleFormSchema = z
  .object({
    ticketId: z.string().min(1, "Billet requis"),
    clientId: z.string().optional(),
    negotiatedPrice: z.coerce.number().min(0, "Prix requis"),
    currency: z.enum(["EUR", "USD", "AED"]),
    paymentStatus: z.enum(["PAID", "DEPOSIT", "PENDING"]),
    paymentMethod: z.enum(["BANK_TRANSFER", "CARD", "CASH", "CRYPTO"]).optional(),
    deliveryStatus: z.enum(["TO_DELIVER", "DELIVERED", "TRANSFER_COMPLETED"]),
    resalePlatform: z.enum(["STUBHUB", "VIAGOGO", "DIRECT_CLIENT", "WHATSAPP", "PRIVATE_SALE"]),
    saleDate: z.string().optional(),
    notes: z.string().optional(),
    createNewClient: z.boolean().optional(),
    newClientFirstName: z.string().optional(),
    newClientLastName: z.string().optional(),
    newClientPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.createNewClient) {
      if (!data.newClientFirstName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prénom requis", path: ["newClientFirstName"] });
      }
      if (!data.newClientLastName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nom requis", path: ["newClientLastName"] });
      }
    } else if (!data.clientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Client requis", path: ["clientId"] });
    }
  });

export type SaleFormValues = z.infer<typeof saleFormSchema>;
