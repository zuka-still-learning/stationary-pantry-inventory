export const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
] as const;

export type MonthKey = (typeof MONTH_KEYS)[number];

export type MonthlyData = {
  stock: number;
  planOrder: number;
  order: number;
  use: number;
  endStock: number;
};

export type InventoryCategory = "Stationary" | "Pantry";

export type InventoryItem = {
  id: string;
  item: string;
  unit: string;
  minimumStock: number;
  price: number;
  category: InventoryCategory;
  months: Record<MonthKey, MonthlyData>;
};

export type InventoryStatus = "Healthy" | "Low Stock";

export type InventoryListItem = InventoryItem & {
  currentMonth: MonthKey;
  currentStock: number;
  recommendedOrder: number;
  status: InventoryStatus;
};

export type DashboardMetric = {
  label: string;
  value: string;
  description: string;
};

export type MonthlyAggregate = {
  month: string;
  monthKey: MonthKey;
  usage: number;
  cost: number;
  stationaryUsage: number;
  pantryUsage: number;
};

export type TopUsedItem = {
  item: string;
  category: InventoryCategory;
  totalUse: number;
};

export type LowStockReportItem = {
  id: string;
  item: string;
  category: InventoryCategory;
  minimumStock: number;
  currentStock: number;
  recommendedOrder: number;
};

export type InventoryUpdatePayload = {
  months: Record<MonthKey, Pick<MonthlyData, "stock" | "planOrder" | "order" | "use" | "endStock">>;
};
