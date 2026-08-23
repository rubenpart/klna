"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  Ticket,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntityTransactionsList } from "@/components/shared/entity-transactions-list";
import { formatCurrency } from "@/lib/currency";
import { sumTransactionMargins } from "@/lib/transaction-stats";
import { useCrmStore } from "@/stores/crm-store";

const typeVariant: Record<string, "default" | "success" | "warning"> = {
  VIP: "success",
  REGULAR: "default",
  BROKER: "warning",
};

const typeLabel: Record<string, string> = {
  VIP: "VIP",
  REGULAR: "Régulier",
  BROKER: "Broker",
};

const channelLabel: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  WORD_OF_MOUTH: "Bouche à oreille",
  B2B: "B2B",
  OTHER: "Autre",
};

interface ClientDetailProps {
  clientId: string;
}

export function ClientDetail({ clientId }: ClientDetailProps) {
  const clients = useCrmStore((s) => s.clients);
  const transactions = useCrmStore((s) => s.transactions);
  const tickets = useCrmStore((s) => s.tickets);

  const client = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId]
  );

  const clientTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.clientId === clientId)
        .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()),
    [transactions, clientId]
  );

  const paidTransactions = useMemo(
    () => clientTransactions.filter((t) => t.paymentStatus !== "PENDING"),
    [clientTransactions]
  );

  const stats = useMemo(() => {
    const totalSpent = paidTransactions.reduce((s, t) => s + t.negotiatedPrice, 0);
    const totalMargin = sumTransactionMargins(paidTransactions, tickets);
    const ticketsSold = paidTransactions.reduce((s, t) => s + (t.soldQuantity ?? 1), 0);
    return { totalSpent, totalMargin, purchaseCount: paidTransactions.length, ticketsSold };
  }, [paidTransactions, tickets]);

  if (!client) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/clients">Retour aux clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-9 gap-1.5 text-muted-foreground">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
            Clients
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {client.firstName[0]}
              {client.lastName[0]}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                  {client.firstName} {client.lastName}
                </h1>
                <Badge variant={typeVariant[client.clientType]} className="text-[10px]">
                  {client.clientType === "VIP" && <Star className="mr-0.5 h-3 w-3" />}
                  {typeLabel[client.clientType]}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {channelLabel[client.acquisitionChannel]}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 shrink-0" />
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 shrink-0" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">LTV</p>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(stats.totalSpent, client.creditCurrency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marge générée</p>
              <p className="text-xl font-bold tabular-nums text-emerald-600">
                {formatCurrency(stats.totalMargin, "EUR")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShoppingBag className="h-3 w-3" />
                Achats
              </p>
              <p className="text-xl font-bold tabular-nums">{stats.purchaseCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-3">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Ticket className="h-3 w-3" />
                Billets
              </p>
              <p className="text-xl font-bold tabular-nums">{stats.ticketsSold}</p>
            </CardContent>
          </Card>
        </div>

        {(client.seatPreferences || client.creditBalance > 0 || client.notes) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {client.seatPreferences && (
              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Préférences places
                  </p>
                  <p className="mt-1 text-sm">{client.seatPreferences}</p>
                </CardContent>
              </Card>
            )}
            {client.creditBalance > 0 && (
              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-4">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Wallet className="h-3 w-3" />
                    Crédit disponible
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    {formatCurrency(client.creditBalance, client.creditCurrency)}
                  </p>
                </CardContent>
              </Card>
            )}
            {client.notes && (
              <Card className="border-border/60 bg-card/50 sm:col-span-2">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm text-muted-foreground">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <EntityTransactionsList
        transactions={clientTransactions}
        variant="client"
        title="Historique des achats"
        emptyMessage="Ce client n'a pas encore d'achat enregistré."
      />
    </div>
  );
}
