"use client";

import { EventsTable } from "@/components/events/events-table";
import { useCrmStore } from "@/stores/crm-store";

export default function EventsPage() {
  const eventStats = useCrmStore((s) => s.eventStats);
  return <EventsTable events={eventStats} />;
}
