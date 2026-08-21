"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, FileText, Filter, Plus, Search, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarginIndicator } from "@/components/inventory/margin-indicator";
import { formatCurrency } from "@/lib/currency";
import { calculateMargin } from "@/lib/margin";
import { formatDate } from "@/lib/utils";
import type { Ticket, TicketStockStatus } from "@/types";
import {
  EVENT_CATEGORY_LABELS,
  TICKET_STOCK_LABELS,
  TICKET_TYPE_LABELS,
  TRANSFER_STATUS_LABELS,
} from "@/types";
import { useCrmStore } from "@/stores/crm-store";
import { PageFilters, PageHeader, TableScroll } from "@/components/layout/page-header";

interface InventoryRow extends Ticket {
  marginResult: ReturnType<typeof calculateMargin>;
  eventName: string;
  eventCategory: string;
}

interface InventoryTableProps {
  tickets: Ticket[];
}

const stockVariant: Record<TicketStockStatus, "success" | "warning" | "secondary"> = {
  IN_STOCK: "success",
  RESERVED: "warning",
  SOLD: "secondary",
};

function buildRows(tickets: Ticket[]): InventoryRow[] {
  return tickets.map((ticket) => {
    const salePrice =
      ticket.stockStatus === "SOLD"
        ? (ticket.actualSalePrice ?? ticket.targetSalePrice ?? 0)
        : (ticket.targetSalePrice ?? 0);

    const marginResult = calculateMargin({
      purchaseUnitPrice: ticket.purchaseUnitPrice,
      purchaseFees: ticket.purchaseFees,
      quantity: ticket.quantity,
      purchaseCurrency: ticket.purchaseCurrency,
      saleUnitPrice: salePrice,
      resaleFees: ticket.stockStatus === "SOLD" ? ticket.resaleFees : 0,
      saleCurrency: ticket.saleCurrency,
    });

    return {
      ...ticket,
      marginResult,
      eventName: ticket.event?.name ?? "—",
      eventCategory: ticket.event?.category ?? "—",
    };
  });
}

export function InventoryTable({ tickets }: InventoryTableProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const data = useMemo(() => buildRows(tickets), [tickets]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (statusFilter !== "ALL" && row.stockStatus !== statusFilter) return false;
      if (categoryFilter !== "ALL" && row.event?.category !== categoryFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        return (
          row.eventName.toLowerCase().includes(q) ||
          row.section?.toLowerCase().includes(q) ||
          row.category?.toLowerCase().includes(q) ||
          row.supplier?.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, statusFilter, categoryFilter, globalFilter]);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        accessorKey: "eventName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-[11px] uppercase"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Événement
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="max-w-[180px] truncate font-medium">{row.original.eventName}</p>
            <p className="text-[10px] text-muted-foreground">
              {row.original.event?.venue} · {formatDate(row.original.event?.dateTime ?? "")}
            </p>
          </div>
        ),
      },
      {
        id: "placement",
        header: "Placement",
        cell: ({ row }) => (
          <div className="text-xs">
            <p>
              {row.original.section} · {row.original.category}
            </p>
            <p className="text-muted-foreground">
              Rang {row.original.row} · Sièges {row.original.seats}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "ticketType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px]">
            {TICKET_TYPE_LABELS[row.original.ticketType]}
          </Badge>
        ),
      },
      {
        id: "purchase",
        header: "Achat",
        cell: ({ row }) => (
          <div className="font-mono text-xs tabular-nums">
            <p>
              {formatCurrency(row.original.purchaseUnitPrice, row.original.purchaseCurrency)} ×{" "}
              {row.original.quantity}
            </p>
            <p className="text-muted-foreground">
              +{formatCurrency(row.original.purchaseFees, row.original.purchaseCurrency)} frais
            </p>
          </div>
        ),
      },
      {
        id: "sale",
        header: "Vente",
        cell: ({ row }) => {
          const price =
            row.original.stockStatus === "SOLD"
              ? row.original.actualSalePrice
              : row.original.targetSalePrice;
          return (
            <div className="font-mono text-xs tabular-nums">
              <p>
                {price
                  ? formatCurrency(price, row.original.saleCurrency)
                  : "—"}{" "}
                {row.original.stockStatus !== "SOLD" && price ? "(cible)" : ""}
              </p>
              {row.original.resaleFees > 0 && (
                <p className="text-muted-foreground">
                  -{formatCurrency(row.original.resaleFees, row.original.saleCurrency)} frais
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "margin",
        header: "Marge",
        cell: ({ row }) => (
          <MarginIndicator
            marginRate={row.original.marginResult.marginRate}
            netMargin={row.original.marginResult.netMargin}
            tier={row.original.marginResult.tier}
            compact
          />
        ),
        sortingFn: (a, b) =>
          a.original.marginResult.marginRate - b.original.marginResult.marginRate,
      },
      {
        accessorKey: "stockStatus",
        header: "Statut",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant={stockVariant[row.original.stockStatus]} className="text-[10px]">
              {TICKET_STOCK_LABELS[row.original.stockStatus]}
            </Badge>
            <p className="text-[10px] text-muted-foreground">
              {TRANSFER_STATUS_LABELS[row.original.transferStatus]}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {(row.original.stockStatus === "IN_STOCK" || row.original.stockStatus === "RESERVED") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-400"
                title="Vendre"
                onClick={() => openDialog("sale", { ticketId: row.original.id })}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openDialog]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const summary = useMemo(() => {
    const inStock = filteredData.filter((r) => r.stockStatus !== "SOLD");
    const totalInvest = inStock.reduce((s, r) => s + r.marginResult.totalPurchaseEur, 0);
    const totalEst = inStock.reduce((s, r) => s + r.marginResult.totalSaleEur, 0);
    const avgMargin =
      filteredData.length > 0
        ? filteredData.reduce((s, r) => s + r.marginResult.marginRate, 0) / filteredData.length
        : 0;
    return { count: filteredData.length, totalInvest, totalEst, avgMargin };
  }, [filteredData]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventaire Billets"
        description={`${summary.count} lignes · Marge moyenne ${summary.avgMargin.toFixed(1)}%`}
        actions={
          <Button size="sm" className="h-10 gap-1.5" onClick={() => openDialog("ticket")}>
            <Plus className="h-4 w-4" />
            Billet
          </Button>
        }
      />

      <PageFilters>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-36">
            <Filter className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous statuts</SelectItem>
            <SelectItem value="IN_STOCK">En stock</SelectItem>
            <SelectItem value="RESERVED">Réservé</SelectItem>
            <SelectItem value="SOLD">Vendu</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 w-full sm:w-36">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes cat.</SelectItem>
            {Object.entries(EVENT_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageFilters>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Investissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(summary.totalInvest, "EUR")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Valeur Estimée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold tabular-nums text-emerald-400">
              {formatCurrency(summary.totalEst, "EUR")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Plus-value Potentielle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(summary.totalEst - summary.totalInvest, "EUR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {filteredData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun billet trouvé.</p>
        ) : (
          filteredData.map((row) => (
            <Card key={row.id} className="border-border/60 bg-card/50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.eventName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.section} · {row.seats} · ×{row.quantity}
                    </p>
                  </div>
                  <MarginIndicator
                    marginRate={row.marginResult.marginRate}
                    netMargin={row.marginResult.netMargin}
                    tier={row.marginResult.tier}
                    compact
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={stockVariant[row.stockStatus]} className="text-[10px]">
                    {TICKET_STOCK_LABELS[row.stockStatus]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {TICKET_TYPE_LABELS[row.ticketType]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Achat {formatCurrency(row.purchaseUnitPrice, row.purchaseCurrency)}
                  </span>
                  {(row.stockStatus === "IN_STOCK" || row.stockStatus === "RESERVED") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1"
                      onClick={() => openDialog("sale", { ticketId: row.id })}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Vendre
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden border-border/60 bg-card/50 lg:block">
        <CardContent className="p-0">
          <TableScroll>
            <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Aucun billet trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </TableScroll>
        </CardContent>
      </Card>
    </div>
  );
}
