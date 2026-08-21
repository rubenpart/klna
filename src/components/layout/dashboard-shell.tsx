"use client";

import { useState } from "react";
import { FormDialogs } from "@/components/forms/form-dialogs";
import { Header } from "@/components/layout/header";
import { MobileBottomNav, MobileDrawer, Sidebar } from "@/components/layout/sidebar";
import { useCrmStore } from "@/stores/crm-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const urgentCount = useCrmStore((s) => s.urgentDeliveries.length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar />
      <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header urgentCount={urgentCount} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 sm:p-5 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} />
      <FormDialogs />
    </div>
  );
}
