"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, Boxes, Download, FileSpreadsheet, LayoutDashboard, PackageOpen, ShoppingBasket } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/stationary", label: "Stationary", icon: FileSpreadsheet },
  { href: "/pantry", label: "Pantry", icon: ShoppingBasket },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/import", label: "Import Excel", icon: PackageOpen }
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[280px]">
      <div className="flex h-full flex-col rounded-[32px] bg-[#16302b] p-4 text-[#f5efdf] shadow-panel">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d5c9a5]">Inventory Control</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">Stock Ledger Studio</h1>
          <p className="mt-3 text-sm text-[#d5ddcf]">
            Excel-backed inventory for Stationary and Pantry operations with monthly planning, orders, and usage.
          </p>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors lg:rounded-2xl",
                  active ? "bg-[#f3ead6] text-[#16302b]" : "bg-white/5 text-[#f5efdf] hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-[#21443c] p-5">
          <p className="text-sm font-semibold">Workbook export</p>
          <p className="mt-2 text-sm text-[#d5ddcf]">Download the latest `inventory.xlsx` snapshot directly from the app.</p>
          <a
            href="/api/export"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f3ead6] px-4 py-2 text-sm font-semibold text-[#16302b] transition hover:bg-white"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </a>
        </div>
      </div>
    </aside>
  );
}
