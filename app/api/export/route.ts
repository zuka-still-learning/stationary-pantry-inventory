import { NextResponse } from "next/server";

import { getWorkbookBuffer } from "@/lib/inventory-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const buffer = await getWorkbookBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="inventory.xlsx"'
    }
  });
}
