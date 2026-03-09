import { MONTH_LABELS } from "@/lib/constants";
import type {
  DashboardMetric,
  InventoryItem,
  InventoryListItem,
  LowStockReportItem,
  MonthKey,
  MonthlyAggregate,
  MonthlyData,
  TopUsedItem
} from "@/types/inventory";
import { MONTH_KEYS } from "@/types/inventory";

export function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    if (!normalized) {
      return 0;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function calculateEndStock(stock: number, order: number, use: number) {
  return stock + order - use;
}

export function recalculateMonths(months: Record<MonthKey, MonthlyData>) {
  const nextMonths = {} as Record<MonthKey, MonthlyData>;
  let previousEndStock = 0;

  MONTH_KEYS.forEach((monthKey, index) => {
    const source = months[monthKey];
    const stock = index === 0 ? toNumber(source.stock) : previousEndStock;
    const planOrder = toNumber(source.planOrder);
    const order = toNumber(source.order);
    const usage = toNumber(source.use);
    const endStock = calculateEndStock(stock, order, usage);

    nextMonths[monthKey] = {
      stock,
      planOrder,
      order,
      use: usage,
      endStock
    };

    previousEndStock = endStock;
  });

  return nextMonths;
}

export function getCurrentMonthKey(date = new Date()): MonthKey {
  return MONTH_KEYS[date.getMonth()] ?? "december";
}

export function getItemCurrentStock(item: InventoryItem, monthKey = getCurrentMonthKey()) {
  return toNumber(item.months[monthKey]?.endStock);
}

export function getRecommendedOrder(item: InventoryItem, monthKey = getCurrentMonthKey()) {
  const currentStock = getItemCurrentStock(item, monthKey);
  return Math.max(0, toNumber(item.minimumStock) - currentStock);
}

export function getInventoryStatus(item: InventoryItem, monthKey = getCurrentMonthKey()) {
  return getItemCurrentStock(item, monthKey) < toNumber(item.minimumStock) ? "Low Stock" : "Healthy";
}

export function enrichInventoryItems(items: InventoryItem[], monthKey = getCurrentMonthKey()): InventoryListItem[] {
  return items.map((item) => ({
    ...item,
    currentMonth: monthKey,
    currentStock: getItemCurrentStock(item, monthKey),
    recommendedOrder: getRecommendedOrder(item, monthKey),
    status: getInventoryStatus(item, monthKey)
  }));
}

export function buildMonthlyAggregates(items: InventoryItem[]): MonthlyAggregate[] {
  return MONTH_KEYS.map((monthKey) => {
    let usage = 0;
    let cost = 0;
    let stationaryUsage = 0;
    let pantryUsage = 0;

    items.forEach((item) => {
      const month = item.months[monthKey];
      const monthUsage = toNumber(month.use);
      const monthCost = monthUsage * toNumber(item.price);

      usage += monthUsage;
      cost += monthCost;

      if (item.category === "Stationary") {
        stationaryUsage += monthUsage;
      } else {
        pantryUsage += monthUsage;
      }
    });

    return {
      month: MONTH_LABELS[monthKey],
      monthKey,
      usage,
      cost,
      stationaryUsage,
      pantryUsage
    };
  });
}

export function buildTopUsedItems(items: InventoryItem[], limit = 8): TopUsedItem[] {
  return items
    .map((item) => ({
      item: item.item,
      category: item.category,
      totalUse: MONTH_KEYS.reduce((sum, monthKey) => sum + toNumber(item.months[monthKey].use), 0)
    }))
    .sort((left, right) => right.totalUse - left.totalUse)
    .slice(0, limit);
}

export function buildLowStockReport(items: InventoryItem[], monthKey = getCurrentMonthKey()): LowStockReportItem[] {
  return enrichInventoryItems(items, monthKey)
    .filter((item) => item.status === "Low Stock")
    .sort((left, right) => right.recommendedOrder - left.recommendedOrder)
    .map((item) => ({
      id: item.id,
      item: item.item,
      category: item.category,
      minimumStock: item.minimumStock,
      currentStock: item.currentStock,
      recommendedOrder: item.recommendedOrder
    }));
}

export function buildDashboardMetrics(items: InventoryItem[], monthKey = getCurrentMonthKey()): DashboardMetric[] {
  const enriched = enrichInventoryItems(items, monthKey);
  const totalUsage = items.reduce((sum, item) => sum + toNumber(item.months[monthKey].use), 0);

  return [
    {
      label: "Total Items",
      value: `${items.length}`,
      description: "Combined active inventory lines"
    },
    {
      label: "Stationary Items",
      value: `${items.filter((item) => item.category === "Stationary").length}`,
      description: "Items sourced from the Stationary sheet"
    },
    {
      label: "Pantry Items",
      value: `${items.filter((item) => item.category === "Pantry").length}`,
      description: "Items sourced from the Pantry sheet"
    },
    {
      label: "Low Stock Items",
      value: `${enriched.filter((item) => item.status === "Low Stock").length}`,
      description: `Below minimum stock in ${MONTH_LABELS[monthKey]}`
    },
    {
      label: "Total Monthly Usage",
      value: `${totalUsage}`,
      description: `Usage logged in ${MONTH_LABELS[monthKey]}`
    }
  ];
}
