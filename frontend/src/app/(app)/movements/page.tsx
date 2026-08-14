"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import api from "@/lib/api";
import type { InventoryItem, PagedResult, StockMovement, StockMovementType } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

const types: StockMovementType[] = ["Outgoing", "Wastage", "Damaged", "Transfer", "Adjustment", "Incoming"];

export default function MovementsPage() {
  const qc = useQueryClient();
  const [inventoryItemId, setInventoryItemId] = useState("");
  const [movementType, setMovementType] = useState<StockMovementType>("Wastage");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: async () => (await api.get<PagedResult<StockMovement>>("/stockmovements", { params: { pageSize: 50 } })).data,
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => (await api.get<PagedResult<InventoryItem>>("/inventory", { params: { pageSize: 200 } })).data,
  });

  const create = useMutation({
    mutationFn: () => api.post("/stockmovements", { inventoryItemId, movementType, quantity, notes }),
    onSuccess: () => {
      toast.success("Stock movement recorded");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Could not record movement"),
  });

  return (
    <AppShell title="Stock Movements">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Record movement</CardTitle>
          <p className="text-sm text-muted-foreground">Use this for kitchen usage, wastage, or damaged stock.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2 space-y-2">
            <Label>Item</Label>
            <select value={inventoryItemId} onChange={(e) => setInventoryItemId(e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="">Select item</option>
              {inventory?.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select value={movementType} onChange={(e) => setMovementType(e.target.value as StockMovementType)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={0} step="0.01" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Saturday service" />
          </div>
          <div className="md:col-span-5">
            <Button disabled={!inventoryItemId || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? "Saving..." : "Save movement"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                {!isLoading && data?.items.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No movements yet.</td></tr>
                )}
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
