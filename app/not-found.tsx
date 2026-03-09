import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Inventory item not found</CardTitle>
          <CardDescription>The requested row could not be resolved from the active Excel workbook.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/inventory">
            <Button>Back to inventory</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
