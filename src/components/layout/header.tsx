"use client";

import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCrmStore } from "@/stores/crm-store";

interface HeaderProps {
  urgentCount?: number;
}

export function Header({ urgentCount = 0 }: HeaderProps) {
  const openDialog = useCrmStore((s) => s.openDialog);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-sm">
      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Recherche globale..." className="w-72 pl-9 h-9 bg-muted/30" />
      </div>

      <div className="flex items-center gap-2">
        {urgentCount > 0 && (
          <Badge variant="critical" className="mr-1">
            {urgentCount} livraison{urgentCount > 1 ? "s" : ""} urgente{urgentCount > 1 ? "s" : ""}
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {urgentCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => openDialog("sale")}>
          <Plus className="h-4 w-4" />
          Vente Express
        </Button>
      </div>
    </header>
  );
}
