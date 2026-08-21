"use client";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { useCrmStore } from "@/stores/crm-store";

export default function AnalyticsPage() {
  const kpis = useCrmStore((s) => s.kpis);
  const topEvents = useCrmStore((s) => s.topEvents);
  const monthlySales = useCrmStore((s) => s.monthlySales);
  const channelProfitability = useCrmStore((s) => s.channelProfitability);
  const transactions = useCrmStore((s) => s.transactions);

  const paidCount = transactions.filter((t) => t.paymentStatus !== "PENDING").length;

  return (
    <AnalyticsDashboard
      topEvents={topEvents}
      monthlySales={monthlySales}
      channelProfitability={channelProfitability}
      totalRevenue={kpis.totalRevenue}
      totalMargin={kpis.totalGrossMargin}
      transactionCount={paidCount}
    />
  );
}
