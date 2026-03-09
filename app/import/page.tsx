import { ImportExcelPanel } from "@/components/import/import-excel-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkbookInfo } from "@/lib/inventory-service";

export default async function ImportPage() {
  const workbookInfo = await getWorkbookInfo();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Workbook Operations</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Import or export the inventory workbook</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Replace the active workbook when finance or operations sends a revised file, or export the latest edited copy back to Excel.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ImportExcelPanel />

        <Card>
          <CardHeader>
            <CardTitle>Current workbook snapshot</CardTitle>
            <CardDescription>Operational metadata for the active file stored in the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Path</p>
              <p className="mt-1 break-all font-medium">{workbookInfo.path}</p>
            </div>
            <div className="rounded-[24px] bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="mt-1 font-medium">{workbookInfo.updatedAt.toLocaleString()}</p>
            </div>
            <div className="rounded-[24px] bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="mt-1 font-medium">{Math.round(workbookInfo.size / 1024)} KB</p>
            </div>
            <a href="/api/export">
              <Button>Export current workbook</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
