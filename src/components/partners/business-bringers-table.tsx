"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Handshake, Plus, Search } from "lucide-react";
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
import type { BusinessBringer } from "@/types";
import { PARTNER_STATUS_LABELS } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface BusinessBringersTableProps {
  businessBringers: BusinessBringer[];
}

export function BusinessBringersTable({ businessBringers }: BusinessBringersTableProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return businessBringers.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          b.firstName.toLowerCase().includes(q) ||
          b.lastName.toLowerCase().includes(q) ||
          b.company?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [businessBringers, search, statusFilter]);

  const activeCount = businessBringers.filter((b) => b.status === "ACTIVE").length;
  const totalRevenue = businessBringers.reduce((s, b) => s + (b.totalReferredRevenue ?? 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Apporteurs d'affaires"
        description={`${businessBringers.length} contacts · ${activeCount} actifs · ${formatCurrency(totalRevenue, "EUR")} apportés`}
        actions={
          <Button size="sm" className="h-10 gap-1.5" onClick={() => openDialog("businessBringer")}>
            <Plus className="h-4 w-4" />
            Apporteur
          </Button>
        }
      />

      <PageFilters>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nom, société, email..."
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
        {filtered.map((bringer) => (
          <Link key={bringer.id} href={`/apporteurs/${bringer.id}`}>
            <Card className="border-border/60 bg-card/50 transition-colors hover:border-primary/30 hover:bg-muted/20">
              <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 shrink-0 text-primary" />
                    <p className="font-medium">
                      {bringer.firstName} {bringer.lastName}
                    </p>
                  </div>
                  {bringer.company && (
                    <p className="text-xs text-muted-foreground">{bringer.company}</p>
                  )}
                  {bringer.email && (
                    <p className="text-xs text-muted-foreground">{bringer.email}</p>
                  )}
                </div>
                <Badge variant={bringer.status === "ACTIVE" ? "success" : "secondary"}>
                  {PARTNER_STATUS_LABELS[bringer.status]}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span>
                  Taux indicatif : <strong>{bringer.commissionRate}%</strong>
                </span>
                <span>
                  Apports : <strong>{bringer.referralCount ?? 0}</strong>
                </span>
                <span className="text-emerald-600">
                  CA apporté : {formatCurrency(bringer.totalReferredRevenue ?? 0, "EUR")}
                </span>
                {(bringer.totalCommissionEarned ?? 0) > 0 && (
                  <span>
                    Commissions : {formatCurrency(bringer.totalCommissionEarned ?? 0, "EUR")}
                  </span>
                )}
              </div>
            </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun apporteur trouvé.</p>
        )}
      </div>
    </div>
  );
}
