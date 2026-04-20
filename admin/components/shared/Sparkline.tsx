"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Props = {
  data: number[];
  tone?: "accent" | "cyan" | "success" | "warn";
  height?: number;
  strokeWidth?: number;
};

const toneColorVar: Record<NonNullable<Props["tone"]>, string> = {
  accent: "var(--primary)",
  cyan: "var(--data-cyan)",
  success: "var(--success)",
  warn: "var(--warn)",
};

export default function Sparkline({
  data,
  tone = "accent",
  height = 44,
  strokeWidth = 1.5,
}: Props) {
  const gradientId = useId();
  const color = toneColorVar[tone];
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
