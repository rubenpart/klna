"use client";

import { FormDialogs } from "@/components/forms/form-dialogs";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useCrmStore } from "@/stores/crm-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const urgentCount = useCrmStore((s) => s.urgentDeliveries.length);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header urgentCount={urgentCount} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <FormDialogs />
    </div>
  );
}
