"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PagedResult, StockMovement } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function MovementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: async () => (await api.get<PagedResult<StockMovement>>("/stockmovements", { params: { pageSize: 50 } })).data,
  });

  return (
    <AppShell title="Stock Movements">
      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
          <p className="text-sm text-muted-foreground">Incoming, outgoing, wastage, and adjustments</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-muted-foreground">
                  <th className="p-3">Date</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Before → After</th>
                  <th className="p-3">By</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="p-6 text-center">Loading...</td></tr>}
                {data?.items.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="p-3">{formatDate(m.createdAt)}</td>
                    <td className="p-3 font-medium">{m.itemName}</td>
                    <td className="p-3"><Badge variant="secondary">{m.movementType}</Badge></td>
                    <td className="p-3">{m.quantity}</td>
                    <td className="p-3 text-muted-foreground">{m.quantityBefore} → {m.quantityAfter}</td>
                    <td className="p-3">{m.performedByName}</td>
                    <td className="p-3 text-muted-foreground">{m.notes ?? "—"}</td>
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
