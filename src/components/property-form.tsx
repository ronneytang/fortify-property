"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { estimateExpenses, canEstimate } from "@/lib/expense-estimates";

const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"] as const;
const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "apartment", label: "Apartment" },
] as const;
const LOAN_TYPES = [
  { value: "PI", label: "Principal & Interest" },
  { value: "IO", label: "Interest Only" },
] as const;

export interface PropertyFormData {
  id?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  landSize: number | null;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  loanBalance: number;
  interestRate: number;
  loanType: string;
  weeklyRent: number;
  propertyManagementPct: number;
  councilRatesAnnual: number;
  insuranceAnnual: number;
  depreciationAnnual: number;
  landTaxAnnual: number;
}

interface PropertyFormProps {
  mode: "add" | "edit";
  initialData?: PropertyFormData;
}

export function PropertyForm({ mode, initialData }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(mode === "edit");
  const [useAutocomplete, setUseAutocomplete] = useState(mode === "add");

  // Property Details
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [suburb, setSuburb] = useState(initialData?.suburb ?? "");
  const [state, setState] = useState(initialData?.state ?? "");
  const [postcode, setPostcode] = useState(initialData?.postcode ?? "");
  const [propertyType, setPropertyType] = useState(initialData?.propertyType ?? "");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() ?? "");
  const [landSize, setLandSize] = useState(initialData?.landSize?.toString() ?? "");

  // Financial Details
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toString() ?? "");
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate ?? "");
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() ?? "");
  const [loanBalance, setLoanBalance] = useState(initialData?.loanBalance?.toString() ?? "");
  const [interestRate, setInterestRate] = useState(initialData?.interestRate?.toString() ?? "");
  const [loanType, setLoanType] = useState(initialData?.loanType ?? "PI");
  const [weeklyRent, setWeeklyRent] = useState(initialData?.weeklyRent?.toString() ?? "");

  // Optional Details
  const [pmPct, setPmPct] = useState(initialData?.propertyManagementPct?.toString() ?? "8.5");
  const [councilRates, setCouncilRates] = useState(initialData?.councilRatesAnnual?.toString() ?? "");
  const [insurance, setInsurance] = useState(initialData?.insuranceAnnual?.toString() ?? "");
  const [depreciation, setDepreciation] = useState(initialData?.depreciationAnnual?.toString() ?? "");
  const [landTax, setLandTax] = useState(initialData?.landTaxAnnual?.toString() ?? "");

  // Estimate tracking
  const [councilRatesEstimated, setCouncilRatesEstimated] = useState(false);
  const [insuranceEstimated, setInsuranceEstimated] = useState(false);
  const [depreciationEstimated, setDepreciationEstimated] = useState(false);
  const [landTaxEstimated, setLandTaxEstimated] = useState(false);

  // Compute expense estimates when enough data is present
  const estimates = useMemo(() => {
    if (!canEstimate(state, propertyType, bedrooms) || !purchasePrice || !currentValue) return null;
    return estimateExpenses({
      state: state as "VIC",
      propertyType: propertyType as "house",
      bedrooms: Number(bedrooms),
      purchasePrice: Number(purchasePrice),
      currentValue: Number(currentValue),
      purchaseDate: purchaseDate || undefined,
    });
  }, [state, propertyType, bedrooms, purchasePrice, currentValue, purchaseDate]);

  function handleAddressSelect(data: { address: string; suburb: string; state: string; postcode: string }) {
    setAddress(data.address);
    setSuburb(data.suburb);
    setState(data.state);
    setPostcode(data.postcode);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        address,
        suburb,
        state,
        postcode,
        propertyType,
        bedrooms: Number(bedrooms),
        purchasePrice: Number(purchasePrice),
        purchaseDate,
        currentValue: Number(currentValue),
        loanBalance: Number(loanBalance),
        interestRate: Number(interestRate),
        loanType,
        weeklyRent: Number(weeklyRent),
      };

      if (landSize) body.landSize = Number(landSize);
      if (pmPct) body.propertyManagementPct = Number(pmPct);
      if (councilRates) body.councilRatesAnnual = Number(councilRates);
      if (insurance) body.insuranceAnnual = Number(insurance);
      if (depreciation) body.depreciationAnnual = Number(depreciation);
      if (landTax) body.landTaxAnnual = Number(landTax);

      const url = mode === "edit" ? `/api/properties/${initialData?.id}` : "/api/properties";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed to ${mode === "edit" ? "update" : "add"} property`);
        return;
      }

      router.push("/properties");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#10b981] focus:border-transparent";
  const labelClass = "block text-xs font-medium text-[#6b7280] mb-1.5";
  const selectClass =
    "w-full bg-white border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#10b981] focus:border-transparent appearance-none";

  const estBadge = (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-[#fef3c7] px-1.5 py-0.5 text-[9px] font-bold text-[#92400e]">
      Est.
    </span>
  );

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] px-6 py-5">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Property" : "Add New Property"}
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          {mode === "edit"
            ? "Update the details and financials for this property."
            : "Enter the details of your investment property."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        {/* Property Details */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Property Details</h2>

          {/* Address section */}
          {useAutocomplete ? (
            <div className="mb-4">
              <label className={labelClass}>Search Address</label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                initialValue={address}
              />
              <button
                type="button"
                onClick={() => setUseAutocomplete(false)}
                className="mt-1.5 text-[11px] text-[#10b981] hover:underline"
              >
                Enter address manually instead
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setUseAutocomplete(true)}
                className="mb-3 text-[11px] text-[#10b981] hover:underline"
              >
                Search for address instead
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!useAutocomplete && (
              <div className="col-span-2">
                <label htmlFor="address" className={labelClass}>Street Address</label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. 12 Smith Street"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="suburb" className={labelClass}>Suburb</label>
              <input
                id="suburb"
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                required
                placeholder="e.g. Richmond"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className={labelClass}>State</label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="" disabled>Select</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="postcode" className={labelClass}>Postcode</label>
                <input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  placeholder="3121"
                  maxLength={4}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className={labelClass}>Property Type</label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                required
                className={selectClass}
              >
                <option value="" disabled>Select type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bedrooms" className={labelClass}>Bedrooms</label>
                <input
                  id="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  required
                  min={1}
                  max={10}
                  placeholder="3"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="landSize" className={labelClass}>Land Size (m&#178;)</label>
                <input
                  id="landSize"
                  type="number"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="450"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Financial Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className={labelClass}>Purchase Price ($)</label>
              <input id="purchasePrice" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required min={0} step={1000} placeholder="650000" className={inputClass} />
            </div>
            <div>
              <label htmlFor="purchaseDate" className={labelClass}>Purchase Date</label>
              <input id="purchaseDate" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="currentValue" className={labelClass}>Current Value ($)</label>
              <input id="currentValue" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required min={0} step={1000} placeholder="720000" className={inputClass} />
            </div>
            <div>
              <label htmlFor="loanBalance" className={labelClass}>Loan Balance ($)</label>
              <input id="loanBalance" type="number" value={loanBalance} onChange={(e) => setLoanBalance(e.target.value)} required min={0} step={1000} placeholder="520000" className={inputClass} />
            </div>
            <div>
              <label htmlFor="interestRate" className={labelClass}>Interest Rate (%)</label>
              <input id="interestRate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} required min={0} max={15} step={0.01} placeholder="6.19" className={inputClass} />
            </div>
            <div>
              <label htmlFor="loanType" className={labelClass}>Loan Type</label>
              <select id="loanType" value={loanType} onChange={(e) => setLoanType(e.target.value)} required className={selectClass}>
                {LOAN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="weeklyRent" className={labelClass}>Weekly Rent ($)</label>
              <input id="weeklyRent" type="number" value={weeklyRent} onChange={(e) => setWeeklyRent(e.target.value)} required min={0} step={5} placeholder="550" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Optional Details with Expense Estimates */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex w-full items-center justify-between rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm font-medium text-[#6b7280] transition hover:bg-[#f4f5f7]"
          >
            <span>Expenses &amp; Deductions {estimates && !showOptional && <span className="ml-1 text-[10px] text-[#10b981] font-semibold">estimates available</span>}</span>
            <svg
              className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOptional && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pmPct" className={labelClass}>PM Fee (%)</label>
                <input id="pmPct" type="number" value={pmPct} onChange={(e) => setPmPct(e.target.value)} min={0} max={15} step={0.1} placeholder="8.5" className={inputClass} />
              </div>

              {/* Council Rates */}
              <div>
                <label htmlFor="councilRates" className={labelClass}>
                  Council Rates ($/yr) {councilRatesEstimated && estBadge}
                </label>
                <input
                  id="councilRates" type="number" value={councilRates}
                  onChange={(e) => { setCouncilRates(e.target.value); setCouncilRatesEstimated(false); }}
                  min={0} step={100} placeholder="1800" className={inputClass}
                />
                {estimates && !councilRates && (
                  <EstimateHelper
                    label={`Typical for a ${bedrooms}-bed ${propertyType} in ${state}`}
                    value={estimates.councilRates}
                    onUse={() => { setCouncilRates(estimates.councilRates.toString()); setCouncilRatesEstimated(true); }}
                  />
                )}
              </div>

              {/* Insurance */}
              <div>
                <label htmlFor="insurance" className={labelClass}>
                  Insurance ($/yr) {insuranceEstimated && estBadge}
                </label>
                <input
                  id="insurance" type="number" value={insurance}
                  onChange={(e) => { setInsurance(e.target.value); setInsuranceEstimated(false); }}
                  min={0} step={100} placeholder="1500" className={inputClass}
                />
                {estimates && !insurance && (
                  <EstimateHelper
                    label={`Typical landlord insurance for a ${bedrooms}-bed ${propertyType} in ${state}`}
                    value={estimates.insurance}
                    onUse={() => { setInsurance(estimates.insurance.toString()); setInsuranceEstimated(true); }}
                  />
                )}
              </div>

              {/* Depreciation */}
              <div>
                <label htmlFor="depreciation" className={labelClass}>
                  Depreciation ($/yr) {depreciationEstimated && estBadge}
                </label>
                <input
                  id="depreciation" type="number" value={depreciation}
                  onChange={(e) => { setDepreciation(e.target.value); setDepreciationEstimated(false); }}
                  min={0} step={100} placeholder="8000" className={inputClass}
                />
                {estimates && !depreciation && (
                  <EstimateHelper
                    label={`Est. Div 40+43 for a ${propertyType} at this price point`}
                    value={estimates.depreciation}
                    onUse={() => { setDepreciation(estimates.depreciation.toString()); setDepreciationEstimated(true); }}
                    note="Get a Quantity Surveyor report for accurate figures"
                  />
                )}
              </div>

              {/* Land Tax */}
              <div>
                <label htmlFor="landTax" className={labelClass}>
                  Land Tax ($/yr) {landTaxEstimated && estBadge}
                </label>
                <input
                  id="landTax" type="number" value={landTax}
                  onChange={(e) => { setLandTax(e.target.value); setLandTaxEstimated(false); }}
                  min={0} step={100} placeholder="0" className={inputClass}
                />
                {estimates && !landTax && (
                  <EstimateHelper
                    label={estimates.landTaxNote}
                    value={estimates.landTax}
                    onUse={() => { setLandTax(estimates.landTax.toString()); setLandTaxEstimated(true); }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#10b981" }}
          >
            {loading
              ? mode === "edit" ? "Saving..." : "Adding Property..."
              : mode === "edit" ? "Save Changes" : "Add Property"
            }
          </button>
          <Link
            href="/properties"
            className="rounded-lg border border-[#e5e7eb] bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-[#6b7280] transition hover:bg-[#f4f5f7]"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Danger zone for edit mode */}
      {mode === "edit" && initialData?.id && (
        <DeleteSection propertyId={initialData.id} address={address} />
      )}
    </div>
  );
}

function EstimateHelper({ label, value, onUse, note }: { label: string; value: number; onUse: () => void; note?: string }) {
  return (
    <div className="mt-1.5 rounded-md bg-[#fef3c7] px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#92400e]">{label}: ~${value.toLocaleString()}/yr</span>
        <button type="button" onClick={onUse} className="text-[11px] font-semibold text-[#10b981] hover:underline">
          Use estimate
        </button>
      </div>
      {note && <div className="text-[10px] text-[#b45309] mt-0.5">{note}</div>}
    </div>
  );
}

function DeleteSection({ propertyId, address }: { propertyId: string; address: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/properties");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border-t border-[#e5e7eb] px-6 py-5">
      <h3 className="text-xs font-semibold text-[#ef4444] mb-2">Danger Zone</h3>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-[#fca5a5] px-4 py-2 text-xs font-semibold text-[#ef4444] hover:bg-[#fef2f2] transition"
        >
          Delete this property
        </button>
      ) : (
        <div className="rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-4">
          <p className="text-xs text-[#991b1b] mb-3">
            Are you sure you want to delete <strong>{address || "this property"}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-[#ef4444] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#dc2626] disabled:opacity-50 transition"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-[#e5e7eb] px-4 py-1.5 text-xs font-semibold text-[#6b7280] hover:bg-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
