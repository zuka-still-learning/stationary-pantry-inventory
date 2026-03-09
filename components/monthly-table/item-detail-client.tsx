"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AlertTriangle, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MONTH_LABELS } from "@/lib/constants";
import { getInventoryStatus, recalculateMonths, toNumber } from "@/lib/calculation";
import type { InventoryItem, MonthKey, MonthlyData } from "@/types/inventory";
import { MONTH_KEYS } from "@/types/inventory";

type EditableMonth = MonthlyData & {
  key: MonthKey;
  label: string;
};

type ItemDetailClientProps = {
  item: InventoryItem;
};

function buildRows(item: InventoryItem): EditableMonth[] {
  return MONTH_KEYS.map((monthKey) => ({
    key: monthKey,
    label: MONTH_LABELS[monthKey],
    ...item.months[monthKey]
  }));
}

function recalculateRows(rows: EditableMonth[]) {
  const prepared = {} as Record<MonthKey, MonthlyData>;

  rows.forEach((row) => {
    prepared[row.key] = {
      stock: row.stock,
      planOrder: row.planOrder,
      order: row.order,
      use: row.use,
      endStock: row.endStock
    };
  });

  const nextMonths = recalculateMonths(prepared);

  return MONTH_KEYS.map((monthKey) => ({
    key: monthKey,
    label: MONTH_LABELS[monthKey],
    ...nextMonths[monthKey]
  }));
}

export function ItemDetailClient({ item }: ItemDetailClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState<EditableMonth[]>(() => buildRows(item));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const lowStockMonths = rows
    .filter((row) => row.endStock < item.minimumStock)
    .map((row) => ({
      ...row,
      recommendedOrder: Math.max(0, item.minimumStock - row.endStock)
    }));

  function handleChange(monthKey: MonthKey, field: "planOrder" | "order" | "use", value: string) {
    setFeedback(null);
    setRows((currentRows) =>
      recalculateRows(
        currentRows.map((row) => (row.key === monthKey ? { ...row, [field]: toNumber(value) } : row))
      )
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/inventory/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            months: rows.reduce(
              (accumulator, row) => ({
                ...accumulator,
                [row.key]: {
                  stock: row.stock,
                  planOrder: row.planOrder,
                  order: row.order,
                  use: row.use,
                  endStock: row.endStock
                }
              }),
              {}
            )
          })
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Unable to save changes.");
        }

        setFeedback("Workbook updated successfully.");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save changes.");
      }
    });
  }

  return (
    <Tabs defaultValue="ledger">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <TabsList>
          <TabsTrigger value="ledger">Monthly Ledger</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Signals</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-3">
          {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <TabsContent value="ledger">
        <Card>
          <CardHeader>
            <CardTitle>Monthly inventory flow</CardTitle>
            <CardDescription>Adjust plan order, order, and usage. End stock and next month opening stock recalculate automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[24px] border border-border/60 bg-white/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Plan Order</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Use</TableHead>
                    <TableHead>End Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const recommendedOrder = Math.max(0, item.minimumStock - row.endStock);
                    const isLow = row.endStock < item.minimumStock;

                    return (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell>{row.stock}</TableCell>
                        <TableCell>
                          <Input
                            min={0}
                            onChange={(event) => handleChange(row.key, "planOrder", event.target.value)}
                            type="number"
                            value={row.planOrder}
                          />
                        </TableCell>
                        <TableCell>
                          <Input min={0} onChange={(event) => handleChange(row.key, "order", event.target.value)} type="number" value={row.order} />
                        </TableCell>
                        <TableCell>
                          <Input min={0} onChange={(event) => handleChange(row.key, "use", event.target.value)} type="number" value={row.use} />
                        </TableCell>
                        <TableCell>{row.endStock}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={isLow ? "destructive" : "success"}>{isLow ? "Low Stock" : "Healthy"}</Badge>
                            {isLow ? <span className="text-xs text-muted-foreground">Suggested order {recommendedOrder}</span> : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alerts">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Low stock months</CardTitle>
              <CardDescription>Any month where end stock falls below the minimum threshold.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockMonths.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No low stock months detected for the current monthly plan.
                </div>
              ) : (
                lowStockMonths.map((row) => (
                  <div key={row.key} className="flex items-center justify-between rounded-[24px] border border-border/60 bg-white/70 p-4">
                    <div>
                      <p className="font-medium">{row.label}</p>
                      <p className="text-sm text-muted-foreground">
                        End stock {row.endStock} against minimum {item.minimumStock}
                      </p>
                    </div>
                    <Badge variant="destructive">Order {Math.max(0, item.minimumStock - row.endStock)}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item summary</CardTitle>
              <CardDescription>Current category, minimum stock, and live status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="mt-1 font-semibold">{item.category}</p>
              </div>
              <div className="rounded-[24px] bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Minimum stock</p>
                <p className="mt-1 font-semibold">{item.minimumStock}</p>
              </div>
              <div className="rounded-[24px] bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Current status</p>
                <div className="mt-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <Badge variant={getInventoryStatus(item) === "Low Stock" ? "destructive" : "success"}>{getInventoryStatus(item)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
