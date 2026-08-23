"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PageFilters, PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/currency";
import type { Seller } from "@/types";
import { PARTNER_STATUS_LABELS } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface SellersTableProps {
  sellers: Seller[];
}

export function SellersTable({ sellers }: SellersTableProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.role?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sellers, search, statusFilter]);

  const activeCount = sellers.filter((s) => s.status === "ACTIVE").length;
  const totalRevenue = sellers.reduce((sum, s) => sum + (s.totalSalesRevenue ?? 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vendeurs"
        description={`${sellers.length} vendeurs · ${activeCount} actifs · ${formatCurrency(totalRevenue, "EUR")} vendus`}
        actions={
          <Button size="sm" className="h-10 gap-1.5" onClick={() => openDialog("seller")}>
            <Plus className="h-4 w-4" />
            Vendeur
          </Button>
        }
      />

      <PageFilters>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nom, rôle, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous</SelectItem>
            <SelectItem value="ACTIVE">Actifs</SelectItem>
            <SelectItem value="INACTIVE">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </PageFilters>

      <div className="space-y-3">
        {filtered.map((seller) => (
          <Link key={seller.id} href={`/vendeurs/${seller.id}`}>
            <Card className="border-border/60 bg-card/50 transition-colors hover:border-primary/30 hover:bg-muted/20">
              <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                    <p className="font-medium">
                      {seller.firstName} {seller.lastName}
                    </p>
                  </div>
                  {seller.role && (
                    <p className="text-xs text-muted-foreground">{seller.role}</p>
                  )}
                  {seller.email && (
                    <p className="text-xs text-muted-foreground">{seller.email}</p>
                  )}
                </div>
                <Badge variant={seller.status === "ACTIVE" ? "success" : "secondary"}>
                  {PARTNER_STATUS_LABELS[seller.status]}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span>
                  Ventes : <strong>{seller.salesCount ?? 0}</strong>
                </span>
                <span className="text-emerald-600">
                  CA : {formatCurrency(seller.totalSalesRevenue ?? 0, "EUR")}
                </span>
              </div>
            </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun vendeur trouvé.</p>
        )}
      </div>
    </div>
  );
}
