"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Handshake, Mail, Phone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntityTransactionsList } from "@/components/shared/entity-transactions-list";
import { formatCurrency } from "@/lib/currency";
import { sumBringerCommissions } from "@/lib/transaction-stats";
import { useCrmStore } from "@/stores/crm-store";
import { PARTNER_STATUS_LABELS } from "@/types";

interface BusinessBringerDetailProps {
  bringerId: string;
}

export function BusinessBringerDetail({ bringerId }: BusinessBringerDetailProps) {
  const businessBringers = useCrmStore((s) => s.businessBringers);
  const transactions = useCrmStore((s) => s.transactions);

  const bringer = useMemo(
    () => businessBringers.find((b) => b.id === bringerId),
    [businessBringers, bringerId]
  );

  const bringerTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.businessBringerId === bringerId)
        .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()),
    [transactions, bringerId]
  );

  const paidTransactions = useMemo(
    () => bringerTransactions.filter((t) => t.paymentStatus !== "PENDING"),
    [bringerTransactions]
  );

  const stats = useMemo(() => {
    const referredClients = new Set(paidTransactions.map((t) => t.clientId));
    const totalRevenue = paidTransactions.reduce((s, t) => s + t.negotiatedPrice, 0);
    const totalCommission = sumBringerCommissions(paidTransactions, bringer);
    return {
      referralCount: paidTransactions.length,
      uniqueClients: referredClients.size,
      totalRevenue,
      totalCommission,
    };
  }, [paidTransactions, bringer]);

  if (!bringer) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Apporteur introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/apporteurs">Retour aux apporteurs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 gap-1.5 text-muted-foreground">
          <Link href="/apporteurs">
            <ArrowLeft className="h-4 w-4" />
            Apporteurs
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                {bringer.firstName} {bringer.lastName}
              </h1>
              <Badge variant={bringer.status === "ACTIVE" ? "success" : "secondary"}>
                {PARTNER_STATUS_LABELS[bringer.status]}
              </Badge>
            </div>
            {bringer.company && (
              <p className="text-sm text-muted-foreground">{bringer.company}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {bringer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0" />
                  {bringer.email}
                </span>
              )}
              {bringer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  {bringer.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Taux indicatif</p>
              <p className="text-xl font-bold tabular-nums">{bringer.commissionRate}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Apports</p>
              <p className="text-xl font-bold tabular-nums">{stats.referralCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Users className="h-3 w-3" />
                Clients
              </p>
              <p className="text-xl font-bold tabular-nums">{stats.uniqueClients}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CA apporté</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(stats.totalRevenue, "EUR")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Commissions totales
              </p>
              <p className="text-2xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(stats.totalCommission, "EUR")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Calculées sur les ventes payées ou en acompte
            </p>
          </CardContent>
        </Card>

        {bringer.notes && (
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm text-muted-foreground">{bringer.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <EntityTransactionsList
        transactions={bringerTransactions}
        variant="bringer"
        bringer={bringer}
        title="Ventes apportées"
        emptyMessage="Aucune vente associée à cet apporteur."
      />
    </div>
  );
}
