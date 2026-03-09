"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyAggregate } from "@/types/inventory";

type UsageLineChartProps = {
  data: MonthlyAggregate[];
};

export function UsageLineChart({ data }: UsageLineChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Monthly Usage</CardTitle>
        <CardDescription>Usage trend across all items from January to December.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,48,43,0.08)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usage" name="Total Usage" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
