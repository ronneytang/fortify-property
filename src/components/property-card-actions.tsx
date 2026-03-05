"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export function PropertyCardActions({ id, address }: { id: string; address: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="mt-3.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-3">
        <p className="text-[11px] text-[#991b1b] mb-2">
          Remove <strong>{address}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#dc2626] disabled:opacity-50 transition"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[11px] font-semibold text-[#6b7280] hover:bg-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3.5 flex gap-2">
      <button className="flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10b981] text-white hover:bg-[#0d9668] transition-colors">
        Refinance Calculator
      </button>
      <Link
        href={`/properties/${id}/edit`}
        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f4f5f7] transition-colors"
      >
        Edit Details
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="px-2 py-1.5 rounded-lg text-[#94a3b8] border border-[#e5e7eb] hover:text-[#ef4444] hover:border-[#fca5a5] transition-colors"
        title="Delete property"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
