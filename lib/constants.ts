import type { InventoryCategory, MonthKey } from "@/types/inventory";
import { MONTH_KEYS } from "@/types/inventory";

export const MONTH_LABELS: Record<MonthKey, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December"
};

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  Stationary: "Stationary",
  Pantry: "Pantry"
};

export const MONTH_SEQUENCE = MONTH_KEYS;
