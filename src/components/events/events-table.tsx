"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Calendar, MapPin, Plus, Search, Ticket } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { EventWithStats } from "@/data/seed/hydrate";
import { EVENT_CATEGORY_LABELS } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface EventsTableProps {
  events: EventWithStats[];
}

const statusVariant: Record<string, "success" | "secondary" | "destructive"> = {
  UPCOMING: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const statusLabel: Record<string, string> = {
  UPCOMING: "À venir",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export function EventsTable({ events }: EventsTableProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (categoryFilter !== "ALL" && e.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, categoryFilter, statusFilter, search]);

  const columns = useMemo<ColumnDef<EventWithStats>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8 text-[11px] uppercase" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Événement <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="max-w-[220px] truncate font-medium">{row.original.name}</p>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {row.original.venue}, {row.original.city}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Catégorie",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px]">
            {EVENT_CATEGORY_LABELS[row.original.category]}
          </Badge>
        ),
      },
      {
        accessorKey: "dateTime",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {formatDateTime(row.original.dateTime)}
            </p>
          </div>
        ),
      },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs">
            <Ticket className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono tabular-nums">
              <span className="text-emerald-400">{row.original.inStock}</span>
              {" / "}
              <span className="text-muted-foreground">{row.original.ticketCount}</span>
            </span>
            {row.original.sold > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {row.original.sold} vendu{row.original.sold > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: "margin",
        header: "Marge",
        cell: ({ row }) =>
          row.original.totalMargin > 0 ? (
            <span className="font-mono text-xs tabular-nums text-emerald-400">
              {formatCurrency(row.original.totalMargin, "EUR")}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Badge variant={statusVariant[row.original.status]} className="text-[10px]">
              {statusLabel[row.original.status]}
            </Badge>
            {row.original.status === "UPCOMING" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Ajouter un billet"
                onClick={() => openDialog("ticket", { eventId: row.original.id })}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [openDialog]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const upcoming = events.filter((e) => e.status === "UPCOMING").length;
  const totalStock = events.reduce((s, e) => s + e.inStock, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Catalogue Événements</h1>
          <p className="text-sm text-muted-foreground">
            {events.length} événements · {upcoming} à venir · {totalStock} billets en stock
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="UPCOMING">À venir</SelectItem>
              <SelectItem value="COMPLETED">Terminé</SelectItem>
              <SelectItem value="CANCELLED">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => openDialog("event")}>
            <Plus className="h-4 w-4" />
            Événement
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {Object.entries(EVENT_CATEGORY_LABELS).map(([key, label]) => {
          const count = events.filter((e) => e.category === key).length;
          return (
            <Card key={key} className="border-border/60 bg-card/50">
              <CardContent className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold tabular-nums">{count}</p>
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">Aucun événement.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
