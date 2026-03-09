import { InventoryDataTable } from "@/components/data-table/inventory-data-table";
import { getInventoryListItems } from "@/lib/inventory-service";

export default async function StationaryPage() {
  const items = await getInventoryListItems("Stationary");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Category</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Stationary inventory</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Items sourced directly from the `Stationary` sheet with month-by-month stock flow and alerts.
        </p>
      </div>

      <InventoryDataTable
        description="Stationary-only view with search, sort, and pagination."
        items={items}
        lockedCategory="Stationary"
        title="Stationary items"
      />
    </div>
  );
}
