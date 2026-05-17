"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Package, AlertTriangle, ClipboardCheck, TrendingUp, Plus, Truck } from "lucide-react";
import api from "@/lib/api";
import type { Dashboard } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

const COLORS = ["#D4AF37", "#F9E4B7", "#B8860B", "#C5A059", "#8B7355", "#5C4A1F", "#2A2112"];

function StatCard({ title, value, icon: Icon, accent }: { title: string; value: string; icon: React.ElementType; accent?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${accent ?? ""}`}>{value}</p>
        </div>
        <div className="rounded-xl bg-gold/10 p-3">
          <Icon className="h-6 w-6 text-gold" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<Dashboard>("/dashboard")).data,
  });

  const chartData = data?.categorySummaries.map((c) => ({
    name: c.category.replace(/([A-Z])/g, " $1").trim(),
    value: c.totalValue,
  })) ?? [];

  return (
    <AppShell title="Dashboard">
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Inventory Value" value={formatCurrency(data?.totalInventoryValue ?? 0)} icon={TrendingUp} accent="text-gold" />
            <StatCard title="Low Stock Items" value={String(data?.lowStockCount ?? 0)} icon={AlertTriangle} accent="text-amber-400" />
            <StatCard title="Pending Approvals" value={String(data?.pendingApprovals ?? 0)} icon={ClipboardCheck} accent="text-amber-400" />
            <StatCard title="Total SKUs" value={String(data?.totalItems ?? 0)} icon={Package} />
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/deliveries/new"><Plus className="h-4 w-4" /> New Delivery</Link></Button>
            <Button variant="outline" asChild><Link href="/inventory"><Package className="h-4 w-4" /> View Inventory</Link></Button>
            <Button variant="outline" asChild><Link href="/deliveries?status=Pending"><Truck className="h-4 w-4" /> Approve Deliveries</Link></Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Stock value distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Split</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Items below minimum threshold</CardDescription>
                </div>
                <Badge variant="danger">{data?.lowStockCount ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.lowStockItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">All stock levels are healthy.</p>
                )}
                {data?.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} · {item.quantity} / {item.minimumThreshold} min</p>
                    </div>
                    <Badge variant="warning">Low</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>Latest stock receiving activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentDeliveries.map((d) => (
                  <Link key={d.id} href={`/deliveries/${d.id}`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-gold/30 hover:bg-gold/5 transition-colors">
                    <div>
                      <p className="font-medium">{d.referenceNumber}</p>
                      <p className="text-xs text-muted-foreground">{d.supplierName} · {formatDate(d.deliveryDate)}</p>
                    </div>
                    <Badge variant={d.status === "Pending" ? "warning" : d.status === "Approved" ? "success" : "danger"}>
                      {d.status}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
