"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Mail, Phone, ShoppingCart, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntityTransactionsList } from "@/components/shared/entity-transactions-list";
import { getTransactionAmountEur } from "@/lib/transaction-stats";
import { formatCurrency } from "@/lib/currency";
import { useCrmStore } from "@/stores/crm-store";
import { PARTNER_STATUS_LABELS } from "@/types";

interface SellerDetailProps {
  sellerId: string;
}

export function SellerDetail({ sellerId }: SellerDetailProps) {
  const sellers = useCrmStore((s) => s.sellers);
  const transactions = useCrmStore((s) => s.transactions);

  const seller = useMemo(
    () => sellers.find((s) => s.id === sellerId),
    [sellers, sellerId]
  );

  const sellerTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.sellerId === sellerId)
        .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()),
    [transactions, sellerId]
  );

  const paidTransactions = useMemo(
    () => sellerTransactions.filter((t) => t.paymentStatus !== "PENDING"),
    [sellerTransactions]
  );

  const stats = useMemo(() => {
    const uniqueClients = new Set(paidTransactions.map((t) => t.clientId));
    const totalRevenue = paidTransactions.reduce((s, t) => s + getTransactionAmountEur(t), 0);
    const ticketsSold = paidTransactions.reduce((s, t) => s + (t.soldQuantity ?? 1), 0);
    return {
      salesCount: paidTransactions.length,
      uniqueClients: uniqueClients.size,
      totalRevenue,
      ticketsSold,
    };
  }, [paidTransactions]);

  if (!seller) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Vendeur introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/vendeurs">Retour aux vendeurs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 gap-1.5 text-muted-foreground">
          <Link href="/vendeurs">
            <ArrowLeft className="h-4 w-4" />
            Vendeurs
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                {seller.firstName} {seller.lastName}
              </h1>
              <Badge variant={seller.status === "ACTIVE" ? "success" : "secondary"}>
                {PARTNER_STATUS_LABELS[seller.status]}
              </Badge>
            </div>
            {seller.role && (
              <p className="text-sm text-muted-foreground">{seller.role}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {seller.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0" />
                  {seller.email}
                </span>
              )}
              {seller.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  {seller.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShoppingCart className="h-3 w-3" />
                Ventes
              </p>
              <p className="text-xl font-bold tabular-nums">{stats.salesCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clients</p>
              <p className="text-xl font-bold tabular-nums">{stats.uniqueClients}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Billets vendus</p>
              <p className="text-xl font-bold tabular-nums">{stats.ticketsSold}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CA total</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(stats.totalRevenue, "EUR")}
              </p>
            </CardContent>
          </Card>
        </div>

        {seller.notes && (
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm text-muted-foreground">{seller.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <EntityTransactionsList
        transactions={sellerTransactions}
        variant="seller"
        title="Historique des ventes"
        emptyMessage="Aucune vente enregistrée pour ce vendeur."
      />
    </div>
  );
}
