"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ArrowLeftRight,
  FileBarChart,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { formatRole } from "@/lib/labels";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/deliveries", label: "Stock Receiving", icon: Truck },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/movements", label: "Stock Movements", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex flex-col items-center gap-2 border-b border-border px-4 py-6">
        <Image src="/logo-icon.png" alt="Imbizo" width={48} height={48} className="rounded-lg" />
        <Image src="/logo-full.png" alt="Imbizo Shisanyama" width={160} height={40} className="h-auto w-40 object-contain" />
        <p className="text-xs text-muted-foreground">Inventory Management</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        {(user?.role === "Admin" || user?.role === "StoreManager") && (
          <Link
            href="/deliveries?status=Pending"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10"
          >
            <ClipboardCheck className="h-4 w-4" />
            Pending Approvals
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground">{user?.role ? formatRole(user.role) : ""}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => { logout(); window.location.href = "/login"; }}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
