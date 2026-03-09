import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import * as XLSX from "xlsx";

import { recalculateMonths, toNumber } from "@/lib/calculation";
import type { InventoryCategory, InventoryItem, InventoryUpdatePayload, MonthKey, MonthlyData } from "@/types/inventory";
import { MONTH_KEYS } from "@/types/inventory";

type SheetConfig = {
  name: InventoryCategory;
  itemColumn: number;
  unitColumn: number;
  minimumStockColumn: number;
  priceColumn: number;
  monthStartColumn: number;
  dataStartRow: number;
};

const SHEET_CONFIG: Record<InventoryCategory, SheetConfig> = {
  Stationary: {
    name: "Stationary",
    itemColumn: 1,
    unitColumn: 4,
    minimumStockColumn: 3,
    priceColumn: 2,
    monthStartColumn: 5,
    dataStartRow: 7
  },
  Pantry: {
    name: "Pantry",
    itemColumn: 0,
    unitColumn: 1,
    minimumStockColumn: 2,
    priceColumn: 3,
    monthStartColumn: 4,
    dataStartRow: 7
  }
};

function encodeId(category: InventoryCategory, rowNumber: number) {
  return `${category.toLowerCase()}__${rowNumber}`;
}

export function decodeInventoryId(id: string) {
  const [categoryToken, rowToken] = id.split("__");
  const category = categoryToken === "stationary" ? "Stationary" : categoryToken === "pantry" ? "Pantry" : null;
  const rowNumber = Number(rowToken);

  if (!category || !Number.isInteger(rowNumber) || rowNumber <= 0) {
    return null;
  }

  return {
    category,
    rowNumber
  } satisfies { category: InventoryCategory; rowNumber: number };
}

function getSheetConfig(category: InventoryCategory) {
  return SHEET_CONFIG[category];
}

export function getWorkbookPath() {
  return path.join(process.cwd(), "data", "inventory.xlsx");
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function parseMonthlyCells(row: unknown[], monthStartColumn: number) {
  const months = {} as Record<MonthKey, MonthlyData>;

  MONTH_KEYS.forEach((monthKey, index) => {
    const baseIndex = monthStartColumn + index * 5;
    const stock = toNumber(row[baseIndex]);
    const planOrder = toNumber(row[baseIndex + 1]);
    const order = toNumber(row[baseIndex + 2]);
    const use = toNumber(row[baseIndex + 3]);
    const storedEndStock = toNumber(row[baseIndex + 4]);

    months[monthKey] = {
      stock,
      planOrder,
      order,
      use,
      endStock: storedEndStock
    };
  });

  return recalculateMonths(months);
}

function isSkippableRow(row: unknown[], config: SheetConfig) {
  const item = sanitizeText(row[config.itemColumn]);
  const unit = sanitizeText(row[config.unitColumn]);
  const minimumStock = toNumber(row[config.minimumStockColumn]);
  const price = toNumber(row[config.priceColumn]);
  const monthlySlice = row.slice(config.monthStartColumn, config.monthStartColumn + MONTH_KEYS.length * 5);
  const hasMonthlyValue = monthlySlice.some((value) => sanitizeText(value) !== "" && toNumber(value) !== 0);

  if (!item) {
    return true;
  }

  if (!unit && minimumStock === 0 && price === 0 && !hasMonthlyValue) {
    return true;
  }

  return false;
}

function parseSheet(workbook: XLSX.WorkBook, category: InventoryCategory) {
  const config = getSheetConfig(category);
  const worksheet = workbook.Sheets[config.name];

  if (!worksheet) {
    return [] as InventoryItem[];
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    blankrows: false,
    raw: true,
    defval: ""
  });

  const items: InventoryItem[] = [];

  for (let rowIndex = config.dataStartRow - 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];

    if (isSkippableRow(row, config)) {
      continue;
    }

    items.push({
      id: encodeId(category, rowIndex + 1),
      item: sanitizeText(row[config.itemColumn]),
      unit: sanitizeText(row[config.unitColumn]),
      minimumStock: toNumber(row[config.minimumStockColumn]),
      price: toNumber(row[config.priceColumn]),
      category,
      months: parseMonthlyCells(row, config.monthStartColumn)
    });
  }

  return items;
}

function loadWorkbook() {
  const workbookPath = getWorkbookPath();

  if (!existsSync(workbookPath)) {
    throw new Error(`Workbook not found at ${workbookPath}`);
  }

  const buffer = readFileSync(workbookPath);

  return XLSX.read(buffer, {
    type: "buffer",
    cellText: false,
    cellDates: false
  });
}

export function validateWorkbookStructure(bufferOrWorkbook: Buffer | XLSX.WorkBook) {
  const workbook = Buffer.isBuffer(bufferOrWorkbook) ? XLSX.read(bufferOrWorkbook, { type: "buffer" }) : bufferOrWorkbook;

  if (!workbook.Sheets.Stationary || !workbook.Sheets.Pantry) {
    throw new Error('Workbook must include "Stationary" and "Pantry" sheets.');
  }

  const parsed = [...parseSheet(workbook, "Stationary"), ...parseSheet(workbook, "Pantry")];

  if (parsed.length === 0) {
    throw new Error("Workbook is valid structurally but no inventory rows were found.");
  }

  return workbook;
}

export function readExcelInventory() {
  const workbook = validateWorkbookStructure(loadWorkbook());

  return [...parseSheet(workbook, "Stationary"), ...parseSheet(workbook, "Pantry")];
}

function setWorksheetCell(worksheet: XLSX.WorkSheet, rowNumber: number, columnIndex: number, value: string | number) {
  const address = XLSX.utils.encode_cell({ r: rowNumber - 1, c: columnIndex });

  if (typeof value === "number") {
    worksheet[address] = {
      t: "n",
      v: value
    };
    return;
  }

  worksheet[address] = {
    t: "s",
    v: value
  };
}

function normalizeUpdatePayload(payload: InventoryUpdatePayload) {
  const prepared = {} as Record<MonthKey, MonthlyData>;

  MONTH_KEYS.forEach((monthKey) => {
    const source = payload.months[monthKey];
    prepared[monthKey] = {
      stock: toNumber(source?.stock),
      planOrder: toNumber(source?.planOrder),
      order: toNumber(source?.order),
      use: toNumber(source?.use),
      endStock: toNumber(source?.endStock)
    };
  });

  return recalculateMonths(prepared);
}

export function updateExcelInventoryItem(id: string, payload: InventoryUpdatePayload) {
  const decoded = decodeInventoryId(id);

  if (!decoded) {
    throw new Error("Invalid inventory id.");
  }

  const workbook = validateWorkbookStructure(loadWorkbook());
  const config = getSheetConfig(decoded.category);
  const worksheet = workbook.Sheets[config.name];
  const nextMonths = normalizeUpdatePayload(payload);

  MONTH_KEYS.forEach((monthKey, index) => {
    const data = nextMonths[monthKey];
    const baseIndex = config.monthStartColumn + index * 5;

    setWorksheetCell(worksheet, decoded.rowNumber, baseIndex, data.stock);
    setWorksheetCell(worksheet, decoded.rowNumber, baseIndex + 1, data.planOrder);
    setWorksheetCell(worksheet, decoded.rowNumber, baseIndex + 2, data.order);
    setWorksheetCell(worksheet, decoded.rowNumber, baseIndex + 3, data.use);
    setWorksheetCell(worksheet, decoded.rowNumber, baseIndex + 4, data.endStock);
  });

  const nextBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  writeFileSync(getWorkbookPath(), nextBuffer);

  return readExcelInventory().find((item) => item.id === id) ?? null;
}
