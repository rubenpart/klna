"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Percent,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatNumber } from "@/lib/utils";
import type { DashboardKPIs } from "@/types";

interface KpiCardsProps {
  kpis: DashboardKPIs;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(kpis.totalRevenue, "EUR"),
      sub: `${formatCurrency(kpis.monthlyRevenue, "EUR")} ce mois`,
      icon: TrendingUp,
      trend: "+12.4%",
      trendUp: true,
      accent: "text-emerald-600",
    },
    {
      title: "Marge Brute",
      value: formatCurrency(kpis.totalGrossMargin, "EUR"),
      sub: `${formatNumber(kpis.averageMarginRate, 1)}% taux moyen`,
      icon: Percent,
      trend: "+3.2pts",
      trendUp: true,
      accent: "text-blue-600",
    },
    {
      title: "Valeur du Stock",
      value: formatCurrency(kpis.stockEstimatedValue, "EUR"),
      sub: `${formatCurrency(kpis.stockInvestment, "EUR")} investi`,
      icon: Wallet,
      trend: `+${formatNumber(((kpis.stockEstimatedValue - kpis.stockInvestment) / kpis.stockInvestment) * 100, 0)}%`,
      trendUp: true,
      accent: "text-violet-400",
    },
    {
      title: "Billets",
      value: `${kpis.ticketsInStock} en stock`,
      sub: `${kpis.ticketsSold} vendus`,
      icon: Ticket,
      trend: `${formatNumber((kpis.ticketsSold / (kpis.ticketsInStock + kpis.ticketsSold)) * 100, 0)}% écoulés`,
      trendUp: true,
      accent: "text-amber-600",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={item}>
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold tabular-nums tracking-tight sm:text-2xl">{card.value}</div>
              <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">{card.sub}</p>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    card.trendUp ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {card.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function StockSummaryBar({ kpis }: KpiCardsProps) {
  const total = kpis.ticketsInStock + kpis.ticketsSold;
  const soldPct = total > 0 ? (kpis.ticketsSold / total) * 100 : 0;

  return (
    <Card className="border-border/60 bg-card/50">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
        <Package className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Rotation du stock</span>
            <span className="font-mono tabular-nums">{formatNumber(soldPct, 0)}% vendu</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm font-semibold tabular-nums">
            {formatCurrency(kpis.stockEstimatedValue - kpis.stockInvestment, "EUR")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Plus-value estimée
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
