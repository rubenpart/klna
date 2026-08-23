"use client";

import { useParams } from "next/navigation";
import { SellerDetail } from "@/components/partners/seller-detail";

export default function SellerPage() {
  const params = useParams();
  const sellerId = params.id as string;

  return <SellerDetail sellerId={sellerId} />;
}
