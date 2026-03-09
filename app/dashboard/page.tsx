import Link from "next/link";

import { CategoryUsageChart } from "@/components/charts/category-usage-chart";
import { TopUsedItemsChart } from "@/components/charts/top-used-items-chart";
import { UsageLineChart } from "@/components/charts/usage-line-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardViewModel } from "@/lib/inventory-service";

export default async function DashboardPage() {
  const { metrics, monthlyAggregates, topUsedItems, lowStockItems } = await getDashboardViewModel();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-[#16302b] via-[#21443c] to-[#2d5d4e] text-white">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#d7c9a1]">Dashboard</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">Inventory visibility from workbook to action.</h1>
              <p className="mt-4 max-w-2xl text-sm text-[#d3ddcf]">
                Track usage, spot low-stock items, and manage monthly planning for Stationary and Pantry without moving away from Excel as the source of truth.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/inventory">
                  <Button className="bg-[#f3ead6] text-[#16302b] hover:bg-white">Open inventory</Button>
                </Link>
                <a href="/api/export">
                  <Button className="border-white/20 bg-transparent text-white hover:bg-white/10" variant="outline">
                    Export workbook
                  </Button>
                </a>
              </div>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-[#d7c9a1]">Low stock focus</p>
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-[#d3ddcf]">
                        {item.category} · current {item.currentStock} / min {item.minimumStock}
                      </p>
                    </div>
                    <Badge variant="warning">Order {item.recommendedOrder}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <SummaryCard key={metric.label} description={metric.description} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <UsageLineChart data={monthlyAggregates} />
        <CategoryUsageChart data={monthlyAggregates} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TopUsedItemsChart data={topUsedItems} />
        <Card>
          <CardHeader>
            <CardTitle>Low stock report</CardTitle>
            <CardDescription>Items below minimum stock for the current month snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border p-6 text-sm text-muted-foreground">
                No low stock items in the current month view.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-border/60 bg-white/70 p-4">
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category} · current {item.currentStock} · minimum {item.minimumStock}
                    </p>
                  </div>
                  <Link href={`/inventory/${item.id}`}>
                    <Badge variant="destructive">Suggested order {item.recommendedOrder}</Badge>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
