"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Ticket,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventaire", icon: Package },
  { href: "/events", label: "Événements", icon: Ticket },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/sales", label: "Ventes", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export const bottomNavItems = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/inventory", label: "Stock", icon: Package },
  { href: "/sales", label: "Ventes", icon: Zap },
  { href: "/events", label: "Events", icon: Ticket },
  { href: "__menu__", label: "Menu", icon: Menu },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("flex h-14 items-center gap-2 border-b border-border/60 px-4", className)}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
          K
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">KLNA</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Conciergerie</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
      </div>
    </>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden h-full w-56 shrink-0 flex-col border-r border-border/60 bg-card/30 lg:flex",
        className
      )}
    >
      <SidebarNav />
    </aside>
  );
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100vw-3rem,18rem)] flex-col border-r border-border/60 bg-background shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-end p-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </div>
  );
}

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {bottomNavItems.map((item) => {
          const isMenu = item.href === "__menu__";
          const isActive = !isMenu && pathname === item.href;

          if (isMenu) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={onMenuOpen}
                className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(isActive && "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
