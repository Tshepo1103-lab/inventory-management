"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import type { Delivery, PagedResult } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { statusBadgeVariant, formatStatus } from "@/lib/labels";

function DeliveriesContent() {
  const params = useSearchParams();
  const status = params.get("status") ?? undefined;
  const canReceive = useAuthStore((s) => s.hasRole("Admin", "StoreManager", "Receiver"));

  const { data, isLoading } = useQuery({
    queryKey: ["deliveries", status],
    queryFn: async () =>
      (await api.get<PagedResult<Delivery>>("/deliveries", { params: { page: 1, pageSize: 30, status } })).data,
  });

  return (
    <AppShell title="Stock Receiving">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Deliveries</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Digitized stock receiving workflow</p>
          </div>
          {canReceive && (
            <Button asChild><Link href="/deliveries/new"><Plus className="h-4 w-4" /> Record Delivery</Link></Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-muted-foreground">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Received By</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading...</td></tr>}
                {!isLoading && data?.items.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No deliveries found.</td></tr>
                )}
                {data?.items.map((d) => (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{d.referenceNumber}</td>
                    <td className="p-3">{d.supplierName}</td>
                    <td className="p-3">{formatDate(d.deliveryDate)}</td>
                    <td className="p-3">{d.receivedByName}</td>
                    <td className="p-3">{d.items.length}</td>
                    <td className="p-3"><Badge variant={statusBadgeVariant(d.status)}>{formatStatus(d.status)}</Badge></td>
                    <td className="p-3">
                      <Link href={`/deliveries/${d.id}`} className="text-gold hover:underline text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function DeliveriesPage() {
  return (
    <Suspense fallback={<AppShell title="Stock Receiving"><p className="text-muted-foreground">Loading...</p></AppShell>}>
      <DeliveriesContent />
    </Suspense>
  );
}
