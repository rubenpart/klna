"use client";

import { KpiCards, StockSummaryBar } from "@/components/dashboard/kpi-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TopEventsChart } from "@/components/dashboard/top-events-chart";
import { UpcomingDeliveries } from "@/components/dashboard/upcoming-deliveries";
import { MonthlySalesChart } from "@/components/dashboard/monthly-sales-chart";
import { useCrmStore } from "@/stores/crm-store";

export function DashboardContent() {
  const kpis = useCrmStore((s) => s.kpis);
  const urgentDeliveries = useCrmStore((s) => s.urgentDeliveries);
  const transactions = useCrmStore((s) => s.transactions);
  const topEvents = useCrmStore((s) => s.topEvents);
  const monthlySales = useCrmStore((s) => s.monthlySales);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">Vue d&apos;ensemble</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Tableau de bord KLNA Conciergerie —{" "}
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <KpiCards kpis={kpis} />
      <StockSummaryBar kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingDeliveries deliveries={urgentDeliveries} />
        <RecentTransactions transactions={transactions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopEventsChart data={topEvents} />
        <MonthlySalesChart data={monthlySales.length > 0 ? monthlySales : [{ month: "—", revenue: 0, margin: 0 }]} />
      </div>
    </div>
  );
}
