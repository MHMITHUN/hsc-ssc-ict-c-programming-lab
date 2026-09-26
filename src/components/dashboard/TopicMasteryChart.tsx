"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopicMastery } from "@/lib/analytics";

/**
 * Topic mastery bar chart (client - recharts renders on the client only).
 * Accessibility: the chart container carries role="img" with a summary
 * label, and the parent page renders the same data as a visible table
 * with a caption, so screen readers and keyboard users get the numbers
 * without the pixels.
 */
export function TopicMasteryChart({ data }: { data: TopicMastery[] }) {
  const summary =
    data.length === 0
      ? "No topic data yet"
      : `Mastery percent per topic: ${data
          .map((d) => `${d.topicTitle} ${d.percent}%`)
          .join(", ")}`;

  return (
    <div
      role="img"
      aria-label={`Bar chart of topic mastery. ${summary}`}
      className="h-80 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 88 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="topicTitle"
            angle={-40}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 11, fill: "#64748b" }}
            height={80}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Mastery"]}
            labelStyle={{ color: "#0f172a" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="percent"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
