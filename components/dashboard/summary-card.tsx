import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
};

export function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-white via-white to-[#f4ecdc]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="rounded-full bg-[#16302b]/5 p-2 text-[#16302b]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-4xl">{value}</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
