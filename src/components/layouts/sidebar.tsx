"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Lightbulb,
  Home,
  Plus,
  TrendingUp,
  Monitor,
  FileText,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  children?: { label: string; href: string }[];
}

const navSections: {
  title: string;
  items: NavItem[];
}[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Portfolio Cockpit",
        href: "/",
        icon: <LayoutGrid size={16} />,
      },
      {
        label: "Intelligence",
        href: "/intelligence",
        icon: <Lightbulb size={16} />,
        badge: "4",
      },
    ],
  },
  {
    title: "MY PROPERTIES",
    items: [
      {
        label: "All Properties",
        href: "/properties",
        icon: <Home size={16} />,
        children: [
          { label: "27 Glendale Ave, Keilor East", href: "/properties/1" },
          { label: "14 Ross St, Maidstone", href: "/properties/2" },
        ],
      },
      {
        label: "+ Add 3rd Property",
        href: "/add-property",
        icon: <Plus size={16} />,
      },
    ],
  },
  {
    title: "PLANNING",
    items: [
      {
        label: "Next Move",
        href: "/next-move",
        icon: <TrendingUp size={16} />,
      },
      {
        label: "Tax Optimiser",
        href: "/tax-optimiser",
        icon: <Monitor size={16} />,
        disabled: true,
      },
      {
        label: "Documents",
        href: "/documents",
        icon: <FileText size={16} />,
        disabled: true,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-[240px] flex-shrink-0 flex-col"
      style={{ backgroundColor: "#1a1d2e" }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white"
          style={{ backgroundColor: "#10b981", fontSize: "16px" }}
        >
          F
        </div>
        <div className="flex flex-col">
          <span
            className="font-bold text-white"
            style={{ fontSize: "15px", lineHeight: "18px" }}
          >
            Fortify
          </span>
          <span style={{ fontSize: "10px", lineHeight: "14px", color: "#64748b" }}>
            Property Intelligence
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <div
              className="mb-2 px-3"
              style={{
                fontSize: "10px",
                color: "#4b5563",
                letterSpacing: "1.5px",
                fontWeight: 600,
              }}
            >
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const isAddProperty = item.href === "/add-property";

                if (isAddProperty) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="mx-1 mt-1 flex items-center gap-2.5 rounded-lg border border-dashed px-3"
                      style={{
                        fontSize: "13px",
                        padding: "9px 12px",
                        borderRadius: "9px",
                        color: "#cbd5e1",
                        borderColor: "#4b5563",
                      }}
                    >
                      <Plus size={16} style={{ color: "#cbd5e1" }} />
                      <span>Add 3rd Property</span>
                    </Link>
                  );
                }

                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      className="flex cursor-not-allowed items-center gap-2.5 opacity-40"
                      style={{
                        fontSize: "13px",
                        padding: "9px 12px",
                        borderRadius: "9px",
                        color: "#cbd5e1",
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  );
                }

                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 transition-colors",
                        isActive
                          ? "text-white"
                          : "hover:text-white"
                      )}
                      style={{
                        fontSize: "13px",
                        padding: "9px 12px",
                        borderRadius: "9px",
                        color: isActive ? "#ffffff" : "#cbd5e1",
                        backgroundColor: isActive ? "#10b981" : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "#252840";
                          e.currentTarget.style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#cbd5e1";
                        }
                      }}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-white"
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            backgroundColor: isActive
                              ? "rgba(255,255,255,0.2)"
                              : "#10b981",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* Sub-items for properties */}
                    {item.children && (
                      <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l pl-3"
                        style={{ borderColor: "#2d3148" }}
                      >
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="transition-colors"
                              style={{
                                fontSize: "12px",
                                padding: "6px 8px",
                                borderRadius: "6px",
                                color: isChildActive ? "#ffffff" : "#94a3b8",
                                backgroundColor: isChildActive
                                  ? "#252840"
                                  : undefined,
                              }}
                              onMouseEnter={(e) => {
                                if (!isChildActive) {
                                  e.currentTarget.style.backgroundColor = "#252840";
                                  e.currentTarget.style.color = "#ffffff";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChildActive) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "#94a3b8";
                                }
                              }}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderTop: "1px solid #2d3148" }}
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white"
          style={{
            backgroundColor: "#10b981",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          RT
        </div>
        <div className="flex flex-col">
          <span
            className="font-bold text-white"
            style={{ fontSize: "13px", lineHeight: "16px" }}
          >
            Ronney Tang
          </span>
          <span style={{ fontSize: "11px", lineHeight: "14px", color: "#64748b" }}>
            Property Investor
          </span>
        </div>
      </div>
    </aside>
  );
}
