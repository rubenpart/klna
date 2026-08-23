"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Handshake,
  LayoutDashboard,
  Ticket,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: Ticket },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/apporteurs", label: "Apporteurs", icon: Handshake },
  { href: "/vendeurs", label: "Vendeurs", icon: UserCheck },
  { href: "/sales", label: "Ventes", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export const mobileNavItems = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Ticket },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/apporteurs", label: "Apport.", icon: Handshake },
  { href: "/vendeurs", label: "Vendeurs", icon: UserCheck },
  { href: "/sales", label: "Ventes", icon: Zap },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarProps) {
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
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden h-full w-56 shrink-0 flex-col border-r border-border/60 bg-muted/30 lg:flex",
        className
      )}
    >
      <SidebarNav />
    </aside>
  );
}

export function MobileTopNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-md lg:hidden">
      <div className="flex gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileNavItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
