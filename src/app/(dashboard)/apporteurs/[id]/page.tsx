"use client";

import { useParams } from "next/navigation";
import { BusinessBringerDetail } from "@/components/partners/business-bringer-detail";

export default function BusinessBringerPage() {
  const params = useParams();
  const bringerId = params.id as string;

  return <BusinessBringerDetail bringerId={bringerId} />;
}
