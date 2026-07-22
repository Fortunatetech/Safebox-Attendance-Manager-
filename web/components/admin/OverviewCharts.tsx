"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const tooltipStyle = {
  background: "#1e2429",
  border: "1px solid #2a333a",
  borderRadius: 8,
  color: "#edeff1",
  fontSize: 13,
};

export function TrendChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#2a333a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke="#5c6870" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#5c6870" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#d9a441", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="count"
          name="Present"
          stroke="#d9a441"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#d9a441" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DepartmentChart({ data }: { data: { department: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#2a333a" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="department"
          stroke="#5c6870"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis stroke="#5c6870" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(217,164,65,0.08)" }} />
        <Bar dataKey="count" name="Attendance" fill="#d9a441" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
