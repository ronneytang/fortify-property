"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle: string;
}

const tabs = [
  { label: "Cockpit", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Next Move", href: "/next-move" },
];

function getPageInfo(pathname: string): { title: string; subtitle: string } {
  switch (pathname) {
    case "/":
      return {
        title: "Portfolio Cockpit",
        subtitle: "2 properties \u00b7 Updated 5 min ago via CoreLogic",
      };
    case "/properties":
      return {
        title: "My Properties",
        subtitle: "Keilor East & Maidstone \u00b7 VIC",
      };
    case "/intelligence":
      return {
        title: "Intelligence",
        subtitle:
          "4 insights this week \u00b7 2 opportunities \u00b7 1 action \u00b7 1 risk",
      };
    case "/next-move":
      return {
        title: "Next Move",
        subtitle: "Borrowing capacity & market analysis for 3rd property",
      };
    case "/add-property":
      return {
        title: "Add Property",
        subtitle: "Add a new investment property to your portfolio",
      };
    default:
      if (pathname.startsWith("/properties/") && pathname.endsWith("/edit")) {
        return {
          title: "Edit Property",
          subtitle: "Update property details and financials",
        };
      }
      return {
        title: "Fortify Property",
        subtitle: "Property Intelligence",
      };
  }
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);
  const displayTitle = title || pageInfo.title;
  const displaySubtitle = subtitle || pageInfo.subtitle;

  return (
    <header
      className="flex h-[60px] flex-shrink-0 items-center justify-between px-6"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* Left: Page title + subtitle */}
      <div className="flex flex-col justify-center">
        <h1
          className="font-bold"
          style={{ fontSize: "16px", lineHeight: "20px", color: "#111827" }}
        >
          {displayTitle}
        </h1>
        <p style={{ fontSize: "12px", lineHeight: "16px", color: "#6b7280" }}>
          {displaySubtitle}
        </p>
      </div>

      {/* Right: Tab navigation + Add Property button */}
      <div className="flex items-center gap-3">
        {/* Tab pills */}
        <div
          className="flex items-center gap-1"
          style={{
            backgroundColor: "#f4f5f7",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            padding: "3px",
          }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="transition-all"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "5px 14px",
                  borderRadius: "7px",
                  color: isActive ? "#111827" : "#6b7280",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive
                    ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Add Property button */}
        <Link
          href="/add-property"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white transition-colors hover:opacity-90"
          style={{
            backgroundColor: "#10b981",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <Plus size={15} />
          <span>Add Property</span>
        </Link>
      </div>
    </header>
  );
}
