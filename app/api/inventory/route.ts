import { NextResponse } from "next/server";

import { getInventoryItems } from "@/lib/inventory-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const category = categoryParam === "Stationary" || categoryParam === "Pantry" ? categoryParam : undefined;
  const items = await getInventoryItems(category);

  return NextResponse.json(items);
}
