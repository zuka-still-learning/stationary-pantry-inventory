import { notFound } from "next/navigation";

import { ItemDetailClient } from "@/components/monthly-table/item-detail-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInventoryStatus, getItemCurrentStock, getRecommendedOrder } from "@/lib/calculation";
import { getInventoryItem } from "@/lib/inventory-service";

type InventoryDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function InventoryDetailPage({ params }: InventoryDetailPageProps) {
  const item = await getInventoryItem(params.id);

  if (!item) {
    notFound();
  }

  const currentStock = getItemCurrentStock(item);
  const recommendedOrder = getRecommendedOrder(item);
  const status = getInventoryStatus(item);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-[#16302b] via-[#21443c] to-[#2d5d4e] text-white">
          <CardContent className="p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-[#d7c9a1]">{item.category}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">{item.item}</h1>
            <p className="mt-4 max-w-2xl text-sm text-[#d3ddcf]">
              Edit monthly plan order, orders, and usage. End stock and next month opening stock update automatically from the workbook formula flow.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Unit</p>
              <p className="mt-2 text-2xl font-semibold">{item.unit || "-"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Current stock</p>
              <p className="mt-2 text-2xl font-semibold">{currentStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={status === "Low Stock" ? "destructive" : "success"}>{status}</Badge>
                {status === "Low Stock" ? <span className="text-sm text-muted-foreground">Suggested order {recommendedOrder}</span> : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ItemDetailClient item={item} />
    </div>
  );
}
