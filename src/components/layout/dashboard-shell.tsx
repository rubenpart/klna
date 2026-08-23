"use client";

import { FormDialogs } from "@/components/forms/form-dialogs";
import { Header } from "@/components/layout/header";
import { LiveClockSync } from "@/components/layout/live-clock-sync";
import { MobileTopNav, Sidebar } from "@/components/layout/sidebar";
import { useCrmStore } from "@/stores/crm-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const urgentCount = useCrmStore((s) => s.urgentDeliveries.length);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header urgentCount={urgentCount} />
        <MobileTopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>

      <FormDialogs />
      <LiveClockSync />
    </div>
  );
}
