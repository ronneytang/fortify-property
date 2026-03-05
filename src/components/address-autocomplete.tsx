"use client";

import { useState, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { MapPin, Search, Loader2 } from "lucide-react";

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (data: { address: string; suburb: string; state: string; postcode: string }) => void;
  initialValue?: string;
}

export function AddressAutocomplete({ onAddressSelect, initialValue = "" }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3 || selecting) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch("/api/places/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: debouncedQuery }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data.predictions || []);
        setIsOpen((data.predictions || []).length > 0);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, selecting]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function selectPrediction(prediction: Prediction) {
    setSelecting(true);
    setIsOpen(false);
    setQuery(prediction.mainText);
    setLoading(true);

    try {
      const res = await fetch("/api/places/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: prediction.placeId }),
      });
      const data = await res.json();
      if (data.address) {
        setQuery(data.address);
        onAddressSelect(data);
      }
    } catch {
      // If details fail, still use the main text
      onAddressSelect({ address: prediction.mainText, suburb: "", state: "", postcode: "" });
    } finally {
      setLoading(false);
      setTimeout(() => setSelecting(false), 500);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectPrediction(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[#e5e7eb] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#10b981] focus:border-transparent";

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelecting(false); }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing an address..."
          className={inputClass}
          autoComplete="off"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af] animate-spin" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              type="button"
              className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition ${
                i === activeIndex ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"
              }`}
              onClick={() => selectPrediction(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#10b981]" />
              <div>
                <div className="text-sm font-medium text-gray-900">{s.mainText}</div>
                <div className="text-[11px] text-[#6b7280]">{s.secondaryText}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
