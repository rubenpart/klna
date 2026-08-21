"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Package, Plus, Search, Send, Truck } from "lucide-react";
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
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import type { Transaction } from "@/types";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RESALE_PLATFORM_LABELS,
} from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface SalesPipelineProps {
  transactions: Transaction[];
}

const paymentVariant: Record<string, "success" | "warning" | "secondary"> = {
  PAID: "success",
  DEPOSIT: "warning",
  PENDING: "secondary",
};

const deliveryVariant: Record<string, "critical" | "warning" | "success" | "secondary"> = {
  TO_DELIVER: "critical",
  DELIVERED: "warning",
  TRANSFER_COMPLETED: "success",
};

const PIPELINE_COLUMNS = [
  { key: "TO_DELIVER" as const, label: "À livrer", icon: Package, color: "border-red-500/30 bg-red-500/5" },
  { key: "DELIVERED" as const, label: "Livré", icon: Truck, color: "border-amber-500/30 bg-amber-500/5" },
  { key: "TRANSFER_COMPLETED" as const, label: "Transfert OK", icon: Send, color: "border-emerald-500/30 bg-emerald-500/5" },
];

export function SalesPipeline({ transactions }: SalesPipelineProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [sorting, setSorting] = useState<SortingState>([{ id: "saleDate", desc: true }]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (paymentFilter !== "ALL" && t.paymentStatus !== paymentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.client?.firstName.toLowerCase().includes(q) ||
          t.client?.lastName.toLowerCase().includes(q) ||
          t.ticket?.event?.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, paymentFilter, search]);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "saleDate",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8 text-[11px] uppercase" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-xs">{formatDateTime(row.original.saleDate)}</span>,
      },
      {
        id: "client",
        header: "Client",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">
              {row.original.client?.firstName} {row.original.client?.lastName}
            </p>
            <p className="max-w-[180px] truncate text-[10px] text-muted-foreground">
              {row.original.ticket?.event?.name}
            </p>
          </div>
        ),
      },
      {
        id: "placement",
        header: "Billet",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.ticket?.section} · {row.original.ticket?.seats}
          </span>
        ),
      },
      {
        accessorKey: "negotiatedPrice",
        header: "Montant",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold tabular-nums">
            {formatCurrency(row.original.negotiatedPrice, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Paiement",
        cell: ({ row }) => (
          <Badge variant={paymentVariant[row.original.paymentStatus]} className="text-[10px]">
            {PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
          </Badge>
        ),
      },
      {
        accessorKey: "deliveryStatus",
        header: "Livraison",
        cell: ({ row }) => (
          <Badge variant={deliveryVariant[row.original.deliveryStatus]} className="text-[10px]">
            {DELIVERY_STATUS_LABELS[row.original.deliveryStatus]}
          </Badge>
        ),
      },
      {
        accessorKey: "resalePlatform",
        header: "Canal",
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.resalePlatform ? RESALE_PLATFORM_LABELS[row.original.resalePlatform] : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalRevenue = transactions
    .filter((t) => t.paymentStatus !== "PENDING")
    .reduce((s, t) => s + t.negotiatedPrice, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pipeline de Vente</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transactions · {formatCurrency(totalRevenue, "EUR")} encaissé
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Client, événement..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 pl-9" />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous paiements</SelectItem>
              <SelectItem value="PAID">Payé</SelectItem>
              <SelectItem value="DEPOSIT">Acompte</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => openDialog("sale")}>
            <Plus className="h-4 w-4" />
            Nouvelle vente
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PIPELINE_COLUMNS.map((col) => {
          const items = transactions.filter((t) => t.deliveryStatus === col.key);
          const Icon = col.icon;
          return (
            <Card key={col.key} className={`border ${col.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {col.label}
                  </span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 space-y-2 overflow-y-auto">
                {items.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="rounded-lg border border-border/40 bg-background/50 p-2">
                    <p className="truncate text-xs font-medium">
                      {txn.client?.firstName} {txn.client?.lastName}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">{txn.ticket?.event?.name}</p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-emerald-400">
                      {formatCurrency(txn.negotiatedPrice, txn.currency)}
                    </p>
                  </div>
                ))}
                {items.length > 5 && (
                  <p className="text-center text-[10px] text-muted-foreground">+{items.length - 5} autres</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
