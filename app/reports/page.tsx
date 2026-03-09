import Link from "next/link";

import { CategoryUsageChart } from "@/components/charts/category-usage-chart";
import { TopUsedItemsChart } from "@/components/charts/top-used-items-chart";
import { UsageLineChart } from "@/components/charts/usage-line-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportsViewModel } from "@/lib/inventory-service";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const { monthlyAggregates, topUsedItems, lowStockItems } = await getReportsViewModel();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Reports</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Usage, cost, and low stock reporting</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Review monthly usage, estimated spend, top-consuming items, and current low stock exceptions from the workbook dataset.
        </p>
      </div>

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">Usage & Cost</TabsTrigger>
          <TabsTrigger value="risk">Low Stock Report</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <UsageLineChart data={monthlyAggregates} />
            <CategoryUsageChart data={monthlyAggregates} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Total usage and cost per month</CardTitle>
                <CardDescription>Cost uses `price × monthly usage` per line item.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-[24px] border border-border/60 bg-white/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Total Usage</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Stationary Usage</TableHead>
                        <TableHead>Pantry Usage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyAggregates.map((row) => (
                        <TableRow key={row.monthKey}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell>{row.usage}</TableCell>
                          <TableCell>{formatCurrency(row.cost)}</TableCell>
                          <TableCell>{row.stationaryUsage}</TableCell>
                          <TableCell>{row.pantryUsage}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <TopUsedItemsChart data={topUsedItems} />
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Current low stock report</CardTitle>
              <CardDescription>Items with end stock below minimum stock and suggested replenishment volume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No items are currently below minimum stock.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="flex items-center justify-between rounded-[24px] border border-border/60 bg-white/70 p-4 transition hover:bg-accent/40"
                  >
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category} · current {item.currentStock} / minimum {item.minimumStock}
                      </p>
                    </div>
                    <Badge variant="destructive">Suggested order {item.recommendedOrder}</Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
