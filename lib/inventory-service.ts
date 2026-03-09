import { readFile, stat, writeFile } from "node:fs/promises";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import {
  buildDashboardMetrics,
  buildLowStockReport,
  buildMonthlyAggregates,
  buildTopUsedItems,
  enrichInventoryItems
} from "@/lib/calculation";
import {
  getWorkbookPath,
  readExcelInventory,
  updateExcelInventoryItem,
  validateWorkbookStructure
} from "@/lib/excel";
import type { InventoryCategory, InventoryUpdatePayload } from "@/types/inventory";

export async function getInventoryItems(category?: InventoryCategory) {
  noStore();

  const items = readExcelInventory();

  if (!category) {
    return items;
  }

  return items.filter((item) => item.category === category);
}

export async function getInventoryListItems(category?: InventoryCategory) {
  const items = await getInventoryItems(category);
  return enrichInventoryItems(items);
}

export async function getInventoryItem(id: string) {
  const items = await getInventoryItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function getDashboardViewModel() {
  const items = await getInventoryItems();

  return {
    items,
    metrics: buildDashboardMetrics(items),
    monthlyAggregates: buildMonthlyAggregates(items),
    topUsedItems: buildTopUsedItems(items),
    lowStockItems: buildLowStockReport(items)
  };
}

export async function getReportsViewModel() {
  const items = await getInventoryItems();

  return {
    monthlyAggregates: buildMonthlyAggregates(items),
    topUsedItems: buildTopUsedItems(items, 12),
    lowStockItems: buildLowStockReport(items)
  };
}

export async function updateInventoryItem(id: string, payload: InventoryUpdatePayload) {
  noStore();
  const updated = updateExcelInventoryItem(id, payload);

  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  revalidatePath("/stationary");
  revalidatePath("/pantry");
  revalidatePath("/reports");
  revalidatePath(`/inventory/${id}`);

  return updated;
}

export async function getWorkbookInfo() {
  noStore();

  const workbookPath = getWorkbookPath();
  const fileStat = await stat(workbookPath);

  return {
    path: workbookPath,
    size: fileStat.size,
    updatedAt: fileStat.mtime
  };
}

export async function replaceWorkbook(buffer: Buffer) {
  noStore();

  validateWorkbookStructure(buffer);
  await writeFile(getWorkbookPath(), buffer);

  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  revalidatePath("/stationary");
  revalidatePath("/pantry");
  revalidatePath("/reports");
  revalidatePath("/import");
}

export async function getWorkbookBuffer() {
  noStore();
  return readFile(getWorkbookPath());
}
