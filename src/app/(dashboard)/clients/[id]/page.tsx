"use client";

import { useParams } from "next/navigation";
import { ClientDetail } from "@/components/clients/client-detail";

export default function ClientPage() {
  const params = useParams();
  const clientId = params.id as string;

  return <ClientDetail clientId={clientId} />;
}
