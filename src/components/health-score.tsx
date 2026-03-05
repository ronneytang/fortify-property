interface HealthScoreProps {
  overall: number;
  scores: { label: string; value: number }[];
  status: "good" | "warning" | "action";
}

export function HealthScore({ overall, scores, status }: HealthScoreProps) {
  const statusConfig = {
    good: { label: "Healthy", bg: "bg-[#d1fae5]", text: "text-[#065f46]" },
    warning: { label: "Monitor", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
    action: { label: "Action needed", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
  };
  const s = statusConfig[status];
  const circumference = 289;
  const offset = circumference - (overall / 100) * circumference;
  const scoreColor = (val: number) => val >= 75 ? "#10b981" : val >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold">Portfolio Health Score</div>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-5 items-center">
        <div className="text-center">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="46" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle cx="55" cy="55" r="46" fill="none" stroke="#10b981" strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              transform="rotate(-90 55 55)" />
            <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">{overall}</text>
            <text x="55" y="66" textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
          </svg>
          <div className="text-[11px] text-[#6b7280] mt-0.5">Overall Score</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {scores.map((score) => (
            <div key={score.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-[#6b7280]">{score.label}</span>
                <span className="text-[11px] font-bold" style={{ color: scoreColor(score.value) }}>{score.value}/100</span>
              </div>
              <div className="bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${score.value}%`, backgroundColor: scoreColor(score.value) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
