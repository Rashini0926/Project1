import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BarChart({ labels, orders, deliveries, returns }) {
  const data = labels.map((month, i) => ({
    month,
    Orders: orders[i] || 0,
    Deliveries: deliveries[i] || 0,
    Returns: returns[i] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Orders" fill="#1abc9c" />
        <Bar dataKey="Deliveries" fill="#3498db" />
        <Bar dataKey="Returns" fill="#e74c3c" />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
