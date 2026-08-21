"use client";

import { Bell, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCrmStore } from "@/stores/crm-store";

interface HeaderProps {
  urgentCount?: number;
  onMenuOpen?: () => void;
}

export function Header({ urgentCount = 0, onMenuOpen }: HeaderProps) {
  const openDialog = useCrmStore((s) => s.openDialog);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-sm sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 lg:hidden"
          onClick={onMenuOpen}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            K
          </div>
          <span className="truncate text-sm font-bold">KLNA</span>
        </div>

        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Recherche globale..."
            className="h-9 w-full max-w-72 bg-muted/30 pl-9"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {urgentCount > 0 && (
          <Badge variant="critical" className="hidden text-[10px] sm:inline-flex sm:text-xs">
            {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
          </Badge>
        )}
        {urgentCount > 0 && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse sm:hidden" />
        )}
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-4 w-4" />
          {urgentCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
        <Button
          size="sm"
          className="h-10 gap-1.5 px-2 sm:px-3"
          onClick={() => openDialog("sale")}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Vente Express</span>
          <span className="sr-only sm:hidden">Vente Express</span>
        </Button>
      </div>
    </header>
  );
}
