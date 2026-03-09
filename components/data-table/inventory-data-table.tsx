"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MONTH_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InventoryCategory, InventoryListItem } from "@/types/inventory";

type SortKey = "item" | "category" | "unit" | "minimumStock" | "currentStock" | "status";
type SortDirection = "asc" | "desc";

type InventoryDataTableProps = {
  items: InventoryListItem[];
  title: string;
  description: string;
  lockedCategory?: InventoryCategory;
};

const PAGE_SIZE = 10;

export function InventoryDataTable({ items, title, description, lockedCategory }: InventoryDataTableProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<InventoryCategory | "all">(lockedCategory ?? "all");
  const [sortKey, setSortKey] = useState<SortKey>("item");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, category, sortKey, sortDirection]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesQuery = !normalizedQuery || item.item.toLowerCase().includes(normalizedQuery);
    const matchesCategory = category === "all" || item.category === category;

    return matchesQuery && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((left, right) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortKey) {
      case "minimumStock":
        return (left.minimumStock - right.minimumStock) * multiplier;
      case "currentStock":
        return (left.currentStock - right.currentStock) * multiplier;
      case "status":
        return left.status.localeCompare(right.status) * multiplier;
      default:
        return String(left[sortKey]).localeCompare(String(right[sortKey])) * multiplier;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = sortedItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const currentMonthLabel = items[0] ? MONTH_LABELS[items[0].currentMonth] : MONTH_LABELS.march;

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search item" />
          </div>
          {!lockedCategory ? (
            <Select value={category} onChange={(event) => setCategory(event.target.value as InventoryCategory | "all")}>
              <option value="all">All Categories</option>
              <option value="Stationary">Stationary</option>
              <option value="Pantry">Pantry</option>
            </Select>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[24px] border border-border/60 bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("item")} type="button">
                    Item
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("category")} type="button">
                    Category
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("unit")} type="button">
                    Unit
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("minimumStock")} type="button">
                    Minimum Stock
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("currentStock")} type="button">
                    Current Stock
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center gap-2" onClick={() => toggleSort("status")} type="button">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={7}>
                    No inventory rows matched the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.unit || "-"}</TableCell>
                    <TableCell>{item.minimumStock}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.currentStock}</p>
                        <p className="text-xs text-muted-foreground">{currentMonthLabel}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "success"}>{item.status}</Badge>
                        {item.status === "Low Stock" ? (
                          <span className="text-xs text-muted-foreground">Suggested order {item.recommendedOrder}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/inventory/${item.id}`}
                        className={cn(
                          "inline-flex items-center rounded-full border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        )}
                      >
                        View detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Showing {(currentPage - 1) * PAGE_SIZE + (paginatedItems.length === 0 ? 0 : 1)}-
            {(currentPage - 1) * PAGE_SIZE + paginatedItems.length} of {sortedItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} size="sm" variant="outline">
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
