import { SEED_IDS, SEED_TIMESTAMPS } from "./ids";
import type { SeedTicketAttachment } from "./types";

const { createdAt } = SEED_TIMESTAMPS;
const A = SEED_IDS.attachments;
const T = SEED_IDS.tickets;

export const seedTicketAttachments: SeedTicketAttachment[] = [
  {
    id: A.psgPdf,
    ticketId: T.psgBoulogne,
    type: "E_TICKET_PDF",
    fileName: "psg-rm-boulogne-14-15.pdf",
    fileUrl: "/uploads/tickets/psg-rm-boulogne-14-15.pdf",
    mimeType: "application/pdf",
    createdAt,
  },
  {
    id: A.badBunnyPdf,
    ticketId: T.badBunnyGoldSplitA,
    type: "E_TICKET_PDF",
    fileName: "badbunny-gold-101-102.pdf",
    fileUrl: "/uploads/tickets/badbunny-gold-101-102.pdf",
    mimeType: "application/pdf",
    createdAt,
  },
  {
    id: A.f1Qr,
    ticketId: T.f1Paddock,
    type: "QR_CODE",
    fileName: "f1-abudhabi-paddock-qr.png",
    fileUrl: "/uploads/tickets/f1-abudhabi-paddock-qr.png",
    mimeType: "image/png",
    createdAt,
  },
  {
    id: A.tomorrowlandTransfer,
    ticketId: T.tomorrowlandComfort,
    type: "TRANSFER_SCREENSHOT",
    fileName: "tomorrowland-transfer-proof.jpg",
    fileUrl: "/uploads/tickets/tomorrowland-transfer-proof.jpg",
    mimeType: "image/jpeg",
    createdAt,
  },
  {
    id: A.taylorTransfer,
    ticketId: T.taylorSwiftFloor,
    type: "TRANSFER_SCREENSHOT",
    fileName: "taylor-swift-transfer.png",
    fileUrl: "/uploads/tickets/taylor-swift-transfer.png",
    mimeType: "image/png",
    createdAt,
  },
  {
    id: A.coachellaPdf,
    ticketId: T.coachellaGA,
    type: "E_TICKET_PDF",
    fileName: "coachella-w1-ga.pdf",
    fileUrl: "/uploads/tickets/coachella-w1-ga.pdf",
    mimeType: "application/pdf",
    createdAt,
  },
];
