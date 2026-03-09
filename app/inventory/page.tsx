import { InventoryDataTable } from "@/components/data-table/inventory-data-table";
import { getInventoryListItems } from "@/lib/inventory-service";

export default async function InventoryPage() {
  const items = await getInventoryListItems();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Inventory</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">All inventory items</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Search, filter, sort, and review the current month stock posture across Stationary and Pantry.
        </p>
      </div>

      <InventoryDataTable
        description="Unified table from both workbook sheets with current month stock and low stock suggestions."
        items={items}
        title="Inventory table"
      />
    </div>
  );
}
