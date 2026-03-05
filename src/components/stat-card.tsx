import { type ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
  change: string;
  changeType: "positive" | "negative" | "neutral" | "warning";
}

export function StatCard({ icon, iconBg, label, value, valueColor, change, changeType }: StatCardProps) {
  const changeColors = {
    positive: "text-[#10b981]",
    negative: "text-[#ef4444]",
    neutral: "text-[#6b7280]",
    warning: "text-[#f59e0b]",
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        {icon}
      </div>
      <div className="text-[11px] text-[#6b7280] font-medium mb-1">{label}</div>
      <div className="text-[22px] font-bold tracking-tight" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
      <div className={`text-[11px] font-semibold mt-1 ${changeColors[changeType]}`}>{change}</div>
    </div>
  );
}
