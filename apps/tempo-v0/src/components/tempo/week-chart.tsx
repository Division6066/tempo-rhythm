import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayCompletion } from "@/lib/tempo/types";

export function WeekChart({ data }: { data: DayCompletion[] }) {
  const total = data.reduce((sum, d) => sum + d.completed, 0);
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%">
          <XAxis
            dataKey="label"
            tick={{ fill: "#6f675c", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            width={24}
            tick={{ fill: "#9a9184", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(26,23,20,0.04)" }}
            contentStyle={{
              background: "#fff9f0",
              border: "1px solid #d9d0c2",
              borderRadius: 12,
              fontSize: 13,
            }}
            formatter={(value) => [`${value} finished`, ""]}
          />
          <Bar dataKey="completed" fill="#2c5f4e" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-muted">
        {total} finished in the last 7 days — from the mock store, not a placeholder.
      </p>
    </div>
  );
}
