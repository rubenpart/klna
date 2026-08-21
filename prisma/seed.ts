import { PrismaClient } from "@prisma/client";
import { SEED_DATABASE } from "../src/data/seed";

const prisma = new PrismaClient();

function toDate(iso: string): Date {
  return new Date(iso);
}

/** Retire les champs UI-only avant insertion Prisma */
function stripEventDemoFields(events: typeof SEED_DATABASE.events) {
  return events.map(({ demoOffsetHours: _, ...event }) => ({
    ...event,
    dateTime: toDate(event.dateTime),
    createdAt: toDate(event.createdAt),
    updatedAt: toDate(event.updatedAt),
  }));
}

async function main() {
  console.log("🌱 Seeding KLNA Conciergerie database...\n");

  // Nettoyage dans l'ordre inverse des FK
  await prisma.transaction.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketBatch.deleteMany();
  await prisma.client.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.event.deleteMany();

  const events = await prisma.event.createMany({
    data: stripEventDemoFields(SEED_DATABASE.events),
  });

  const suppliers = await prisma.supplier.createMany({
    data: SEED_DATABASE.suppliers.map((s) => ({
      ...s,
      createdAt: toDate(s.createdAt),
      updatedAt: toDate(s.updatedAt),
    })),
  });

  const clients = await prisma.client.createMany({
    data: SEED_DATABASE.clients.map((c) => ({
      ...c,
      createdAt: toDate(c.createdAt),
      updatedAt: toDate(c.updatedAt),
    })),
  });

  const ticketBatches = await prisma.ticketBatch.createMany({
    data: SEED_DATABASE.ticketBatches.map((b) => ({
      ...b,
      purchaseDate: toDate(b.purchaseDate),
      createdAt: toDate(b.createdAt),
      updatedAt: toDate(b.updatedAt),
    })),
  });

  const tickets = await prisma.ticket.createMany({
    data: SEED_DATABASE.tickets.map((t) => ({
      ...t,
      purchaseDate: toDate(t.purchaseDate),
      createdAt: toDate(t.createdAt),
      updatedAt: toDate(t.updatedAt),
    })),
  });

  const attachments = await prisma.ticketAttachment.createMany({
    data: SEED_DATABASE.ticketAttachments.map((a) => ({
      ...a,
      createdAt: toDate(a.createdAt),
    })),
  });

  const transactions = await prisma.transaction.createMany({
    data: SEED_DATABASE.transactions.map((t) => ({
      ...t,
      saleDate: toDate(t.saleDate),
      createdAt: toDate(t.createdAt),
      updatedAt: toDate(t.updatedAt),
    })),
  });

  console.log(`  ✓ ${events.count} events`);
  console.log(`  ✓ ${suppliers.count} suppliers`);
  console.log(`  ✓ ${clients.count} clients`);
  console.log(`  ✓ ${ticketBatches.count} ticket batches`);
  console.log(`  ✓ ${tickets.count} tickets`);
  console.log(`  ✓ ${attachments.count} attachments`);
  console.log(`  ✓ ${transactions.count} transactions`);
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
