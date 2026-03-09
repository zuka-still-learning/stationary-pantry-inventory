import { NextResponse } from "next/server";

import { getInventoryItem, updateInventoryItem } from "@/lib/inventory-service";
import type { InventoryUpdatePayload } from "@/types/inventory";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const item = await getInventoryItem(params.id);

  if (!item) {
    return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = (await request.json()) as InventoryUpdatePayload;
    const item = await updateInventoryItem(params.id, payload);

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update inventory item." },
      { status: 400 }
    );
  }
}
