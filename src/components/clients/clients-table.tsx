"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Mail, Phone, Plus, Search, Star } from "lucide-react";
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
import type { Client } from "@/types";
import { useCrmStore } from "@/stores/crm-store";

interface ClientsTableProps {
  clients: Client[];
  transactionCountByClient?: Record<string, number>;
}

const typeVariant: Record<string, "default" | "success" | "warning"> = {
  VIP: "success",
  REGULAR: "default",
  BROKER: "warning",
};

const typeLabel: Record<string, string> = {
  VIP: "VIP",
  REGULAR: "Régulier",
  BROKER: "Broker",
};

const channelLabel: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  WORD_OF_MOUTH: "Bouche à oreille",
  B2B: "B2B",
  OTHER: "Autre",
};

export function ClientsTable({ clients, transactionCountByClient }: ClientsTableProps) {
  const openDialog = useCrmStore((s) => s.openDialog);
  const [sorting, setSorting] = useState<SortingState>([{ id: "totalSpent", desc: true }]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (typeFilter !== "ALL" && c.clientType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
        );
      }
      return true;
    });
  }, [clients, typeFilter, search]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: "name",
        accessorFn: (r) => `${r.firstName} ${r.lastName}`,
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8 text-[11px] uppercase" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Client <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {row.original.firstName[0]}{row.original.lastName[0]}
            </div>
            <div>
              <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {row.original.email && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{row.original.email}</span>}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "clientType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant={typeVariant[row.original.clientType]} className="text-[10px]">
            {row.original.clientType === "VIP" && <Star className="mr-0.5 h-3 w-3" />}
            {typeLabel[row.original.clientType]}
          </Badge>
        ),
      },
      {
        accessorKey: "acquisitionChannel",
        header: "Canal",
        cell: ({ row }) => (
          <span className="text-xs">{channelLabel[row.original.acquisitionChannel]}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact",
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {row.original.phone && <><Phone className="h-3 w-3" />{row.original.phone}</>}
          </span>
        ),
      },
      {
        accessorKey: "totalSpent",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-3 h-8 text-[11px] uppercase" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            LTV <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm tabular-nums font-semibold">
            {formatCurrency(row.original.totalSpent ?? 0, row.original.creditCurrency)}
          </span>
        ),
      },
      {
        accessorKey: "totalMarginGenerated",
        header: "Marge générée",
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums text-emerald-400">
            {formatCurrency(row.original.totalMarginGenerated ?? 0, "EUR")}
          </span>
        ),
      },
      {
        id: "purchases",
        header: "Achats",
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {transactionCountByClient?.[row.original.id] ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "creditBalance",
        header: "Crédit",
        cell: ({ row }) =>
          row.original.creditBalance > 0 ? (
            <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
              {formatCurrency(row.original.creditBalance, row.original.creditCurrency)}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [transactionCountByClient]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalLTV = clients.reduce((s, c) => s + (c.totalSpent ?? 0), 0);
  const vipCount = clients.filter((c) => c.clientType === "VIP").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Fichier Clients</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} contacts · {vipCount} VIP · LTV total {formatCurrency(totalLTV, "EUR")}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nom, email, tel..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous types</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="REGULAR">Régulier</SelectItem>
              <SelectItem value="BROKER">Broker</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => openDialog("client")}>
            <Plus className="h-4 w-4" />
            Client
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clients actifs</p>
            <p className="text-2xl font-bold">{clients.filter((c) => (c.totalSpent ?? 0) > 0).length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">LTV moyen</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalLTV / clients.length, "EUR")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marge clients</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-400">
              {formatCurrency(clients.reduce((s, c) => s + (c.totalMarginGenerated ?? 0), 0), "EUR")}
            </p>
          </CardContent>
        </Card>
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
