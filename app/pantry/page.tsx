import { InventoryDataTable } from "@/components/data-table/inventory-data-table";
import { getInventoryListItems } from "@/lib/inventory-service";

export default async function PantryPage() {
  const items = await getInventoryListItems("Pantry");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Category</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Pantry inventory</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Items sourced directly from the `Pantry` sheet, including low stock recommendations against the monthly plan.
        </p>
      </div>

      <InventoryDataTable
        description="Pantry-only view with search, sort, and pagination."
        items={items}
        lockedCategory="Pantry"
        title="Pantry items"
      />
    </div>
  );
}
