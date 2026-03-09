"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopUsedItem } from "@/types/inventory";

type TopUsedItemsChartProps = {
  data: TopUsedItem[];
};

export function TopUsedItemsChart({ data }: TopUsedItemsChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Used Items</CardTitle>
        <CardDescription>Highest yearly usage volume across both categories.</CardDescription>
      </CardHeader>
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(22,48,43,0.08)" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="item" width={180} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="totalUse" name="Total Use" fill="hsl(var(--chart-4))" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
