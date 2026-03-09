"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { FileUp, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ImportExcelPanel() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpload() {
    if (!file) {
      setMessage("Choose an .xlsx file first.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/import", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Import failed.");
        }

        setMessage("Workbook imported successfully.");
        setFile(null);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Import failed.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import a replacement workbook</CardTitle>
        <CardDescription>The uploaded file must include `Stationary` and `Pantry` sheets using the existing monthly layout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[28px] border border-dashed border-border bg-white/70 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <FileUp className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium">Upload `.xlsx` workbook</p>
              <p className="text-sm text-muted-foreground">The current workbook in `data/inventory.xlsx` will be replaced.</p>
            </div>
          </div>
          <Input accept=".xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!file || isPending}>
              <Upload className="h-4 w-4" />
              {isPending ? "Importing..." : "Replace workbook"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Replace the active inventory workbook?</DialogTitle>
              <DialogDescription>
                This will overwrite `data/inventory.xlsx` with the selected file and refresh dashboard, inventory, and reports data.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
              Selected file: <span className="font-semibold">{file?.name ?? "None"}</span>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload}>Confirm import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
