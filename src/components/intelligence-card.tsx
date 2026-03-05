interface IntelligenceCardProps {
  type: "opportunity" | "action" | "risk";
  property?: string;
  category: string;
  title: string;
  body: string;
  dollarLabel?: string;
  tagColor: "green" | "blue" | "amber" | "red" | "purple";
  borderColor: "emerald" | "amber" | "red";
  source: string;
  actions: { label: string; variant: "primary" | "ghost" }[];
}

export function IntelligenceCard({ type, property, category, title, body, dollarLabel, tagColor, borderColor, source, actions }: IntelligenceCardProps) {
  const borderColors = { emerald: "border-l-[#10b981]", amber: "border-l-[#f59e0b]", red: "border-l-[#ef4444]" };
  const typeConfig = {
    opportunity: { label: "Opportunity", bg: "bg-[#d1fae5]", text: "text-[#065f46]" },
    action: { label: "Action Needed", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
    risk: { label: "Risk", bg: "bg-[#fee2e2]", text: "text-[#991b1b]" },
  };
  const tagColorMap: Record<string, string> = {
    green: "bg-[#d1fae5] text-[#065f46]",
    blue: "bg-[#dbeafe] text-[#1e40af]",
    amber: "bg-[#fef3c7] text-[#92400e]",
    red: "bg-[#fee2e2] text-[#991b1b]",
    purple: "bg-[#f3e8ff] text-[#6b21a8]",
  };
  const t = typeConfig[type];

  return (
    <div className={`bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5 border-l-[3px] ${borderColors[borderColor]} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${t.bg} ${t.text}`}>{t.label}</span>
            {property && <span className="text-[10px] text-[#9ca3af]">{property} · {category}</span>}
          </div>
          <div className="text-[13px] font-bold">{title}</div>
        </div>
        {dollarLabel && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tagColorMap[tagColor]}`}>
            {dollarLabel}
          </span>
        )}
      </div>
      <div className="text-xs text-[#6b7280] leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
      <div className="mt-3 flex items-center gap-2">
        {actions.map((action, i) => (
          <button key={i} className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            action.variant === "primary"
              ? "bg-[#10b981] text-white hover:bg-[#0d9668]"
              : "bg-transparent text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f4f5f7]"
          }`}>
            {action.label}
          </button>
        ))}
        <span className="text-[10px] text-[#9ca3af]">{source}</span>
      </div>
    </div>
  );
}
