"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { MonthlySalesChart } from "@/components/dashboard/monthly-sales-chart";

interface AnalyticsDashboardProps {
  topEvents: { name: string; margin: number; revenue: number }[];
  monthlySales: { month: string; revenue: number; margin: number }[];
  channelProfitability: { channel: string; margin: number; count: number }[];
  totalRevenue: number;
  totalMargin: number;
  transactionCount: number;
}

const CHANNEL_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function AnalyticsDashboard({
  topEvents,
  monthlySales,
  channelProfitability,
  totalRevenue,
  totalMargin,
  transactionCount,
}: AnalyticsDashboardProps) {
  const marginRate = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">Analytics & Reporting</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {transactionCount} ventes analysées · Taux de marge global {marginRate.toFixed(1)}%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CA Total</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalRevenue, "EUR")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marge Brute</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-600">{formatCurrency(totalMargin, "EUR")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold tabular-nums">{transactionCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Panier moyen</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(transactionCount > 0 ? totalRevenue / transactionCount : 0, "EUR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlySalesChart data={monthlySales.length > 0 ? monthlySales : [{ month: "—", revenue: 0, margin: 0 }]} />

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Rentabilité par Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelProfitability}
                  dataKey="margin"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {channelProfitability.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { channel: string; margin: number; count: number };
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold">{d.channel}</p>
                        <p>Marge : {formatCurrency(d.margin, "EUR")}</p>
                        <p>{d.count} ventes</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {channelProfitability.map((c, i) => (
                <span key={c.channel} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                  {c.channel} ({c.count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Top Événements — Marge vs CA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEvents} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as { name: string; margin: number; revenue: number };
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                      <p className="font-semibold">{d.name}</p>
                      <p>CA : {formatCurrency(d.revenue, "EUR")}</p>
                      <p>Marge : {formatCurrency(d.margin, "EUR")}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" fill="hsl(217 91% 60% / 0.5)" radius={[0, 3, 3, 0]} barSize={12} />
              <Bar dataKey="margin" fill="hsl(142 76% 46% / 0.8)" radius={[0, 3, 3, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Détail Canaux de Revente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {channelProfitability.map((c, i) => {
              const maxMargin = channelProfitability[0]?.margin ?? 1;
              const pct = (c.margin / maxMargin) * 100;
              return (
                <div key={c.channel}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{c.channel}</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(c.margin, "EUR")} · {c.count} ventes
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
