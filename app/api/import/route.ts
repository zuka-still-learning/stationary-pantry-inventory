import { NextResponse } from "next/server";

import { replaceWorkbook } from "@/lib/inventory-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json({ error: "Only .xlsx files are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await replaceWorkbook(buffer);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import workbook." },
      { status: 400 }
    );
  }
}
