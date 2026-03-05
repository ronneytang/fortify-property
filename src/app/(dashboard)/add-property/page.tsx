"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  // Property Details
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [landSize, setLandSize] = useState("");

  // Financial Details
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [loanBalance, setLoanBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanType, setLoanType] = useState("PI");
  const [weeklyRent, setWeeklyRent] = useState("");

  // Optional Details
  const [pmPct, setPmPct] = useState("8.5");
  const [councilRates, setCouncilRates] = useState("");
  const [insurance, setInsurance] = useState("");
  const [depreciation, setDepreciation] = useState("");
  const [landTax, setLandTax] = useState("");

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

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add property");
        return;
      }

      router.push("/properties");
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] px-6 py-5">
          <h1 className="text-lg font-bold text-gray-900">Add New Property</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Enter the details of your investment property.
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
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Property Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Street Address
                </label>
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

              <div>
                <label htmlFor="suburb" className={labelClass}>
                  Suburb
                </label>
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
                  <label htmlFor="state" className={labelClass}>
                    State
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="postcode" className={labelClass}>
                    Postcode
                  </label>
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
                <label htmlFor="propertyType" className={labelClass}>
                  Property Type
                </label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bedrooms" className={labelClass}>
                    Bedrooms
                  </label>
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
                  <label htmlFor="landSize" className={labelClass}>
                    Land Size (m&#178;)
                  </label>
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
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Financial Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchasePrice" className={labelClass}>
                  Purchase Price ($)
                </label>
                <input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                  min={0}
                  step={1000}
                  placeholder="650000"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="purchaseDate" className={labelClass}>
                  Purchase Date
                </label>
                <input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="currentValue" className={labelClass}>
                  Current Value ($)
                </label>
                <input
                  id="currentValue"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                  min={0}
                  step={1000}
                  placeholder="720000"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="loanBalance" className={labelClass}>
                  Loan Balance ($)
                </label>
                <input
                  id="loanBalance"
                  type="number"
                  value={loanBalance}
                  onChange={(e) => setLoanBalance(e.target.value)}
                  required
                  min={0}
                  step={1000}
                  placeholder="520000"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="interestRate" className={labelClass}>
                  Interest Rate (%)
                </label>
                <input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                  min={0}
                  max={15}
                  step={0.01}
                  placeholder="6.19"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="loanType" className={labelClass}>
                  Loan Type
                </label>
                <select
                  id="loanType"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  required
                  className={selectClass}
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="weeklyRent" className={labelClass}>
                  Weekly Rent ($)
                </label>
                <input
                  id="weeklyRent"
                  type="number"
                  value={weeklyRent}
                  onChange={(e) => setWeeklyRent(e.target.value)}
                  required
                  min={0}
                  step={5}
                  placeholder="550"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Optional Details (collapsible) */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex w-full items-center justify-between rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm font-medium text-[#6b7280] transition hover:bg-[#f4f5f7]"
            >
              <span>Optional Details</span>
              <svg
                className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showOptional && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pmPct" className={labelClass}>
                    PM Fee (%)
                  </label>
                  <input
                    id="pmPct"
                    type="number"
                    value={pmPct}
                    onChange={(e) => setPmPct(e.target.value)}
                    min={0}
                    max={15}
                    step={0.1}
                    placeholder="8.5"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="councilRates" className={labelClass}>
                    Council Rates ($/yr)
                  </label>
                  <input
                    id="councilRates"
                    type="number"
                    value={councilRates}
                    onChange={(e) => setCouncilRates(e.target.value)}
                    min={0}
                    step={100}
                    placeholder="1800"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="insurance" className={labelClass}>
                    Insurance ($/yr)
                  </label>
                  <input
                    id="insurance"
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    min={0}
                    step={100}
                    placeholder="1500"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="depreciation" className={labelClass}>
                    Depreciation ($/yr)
                  </label>
                  <input
                    id="depreciation"
                    type="number"
                    value={depreciation}
                    onChange={(e) => setDepreciation(e.target.value)}
                    min={0}
                    step={100}
                    placeholder="8000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="landTax" className={labelClass}>
                    Land Tax ($/yr)
                  </label>
                  <input
                    id="landTax"
                    type="number"
                    value={landTax}
                    onChange={(e) => setLandTax(e.target.value)}
                    min={0}
                    step={100}
                    placeholder="0"
                    className={inputClass}
                  />
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
              {loading ? "Adding Property..." : "Add Property"}
            </button>
            <Link
              href="/properties"
              className="rounded-lg border border-[#e5e7eb] bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-[#6b7280] transition hover:bg-[#f4f5f7]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
