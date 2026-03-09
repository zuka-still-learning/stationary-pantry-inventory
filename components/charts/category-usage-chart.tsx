"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyAggregate } from "@/types/inventory";

type CategoryUsageChartProps = {
  data: MonthlyAggregate[];
};

export function CategoryUsageChart({ data }: CategoryUsageChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stationary vs Pantry Usage</CardTitle>
        <CardDescription>Monthly split of consumption per source sheet.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,48,43,0.08)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="stationaryUsage" name="Stationary" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pantryUsage" name="Pantry" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
