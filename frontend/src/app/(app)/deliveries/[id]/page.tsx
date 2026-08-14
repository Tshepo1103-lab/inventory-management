"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Delivery } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { statusBadgeVariant, formatStatus } from "@/lib/labels";
import { useState } from "react";

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const canApprove = useAuthStore((s) => s.hasRole("Admin", "StoreManager"));
  const [managerNotes, setManagerNotes] = useState("");
  const [approvals, setApprovals] = useState<Record<string, { qty: number; approved: boolean }>>({});

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: async () => (await api.get<Delivery>(`/deliveries/${id}`)).data,
    enabled: !!id,
  });

  const approve = useMutation({
    mutationFn: (status: "Approved" | "PartiallyApproved" | "Rejected") =>
      api.post(`/deliveries/${id}/approve`, {
        status,
        managerNotes,
        items: delivery?.items.map((item) => ({
          deliveryItemId: item.id,
          quantityApproved: status === "Rejected" ? 0 : (approvals[item.id]?.qty ?? item.quantityDelivered),
          isApproved: status !== "Rejected",
        })),
      }),
    onSuccess: (_, status) => {
      toast.success(status === "Rejected" ? "Delivery rejected" : "Inventory updated from this delivery");
      qc.invalidateQueries({ queryKey: ["delivery", id] });
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["movements"] });
    },
    onError: () => toast.error("Approval failed"),
  });

  if (isLoading || !delivery) {
    return <AppShell title="Delivery"><p className="text-muted-foreground">Loading...</p></AppShell>;
  }

  return (
    <AppShell title={`Delivery ${delivery.referenceNumber}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{delivery.referenceNumber}</CardTitle>
              <Badge variant={statusBadgeVariant(delivery.status)}>
                {formatStatus(delivery.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Supplier</span><p className="font-medium">{delivery.supplierName}</p></div>
              <div><span className="text-muted-foreground">Date</span><p className="font-medium">{formatDate(delivery.deliveryDate)}</p></div>
              <div><span className="text-muted-foreground">Received By</span><p className="font-medium">{delivery.receivedByName}</p></div>
              <div><span className="text-muted-foreground">Signature</span><p className="font-medium">{delivery.receiverSignature}</p></div>
            </div>
            {delivery.damagedNotes && <p className="text-sm text-amber-400">Damaged notes: {delivery.damagedNotes}</p>}
            {delivery.invoiceFilePath && <p className="text-sm text-muted-foreground">Invoice attached</p>}

            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr><th className="p-2 text-left">Item</th><th className="p-2">Delivered</th><th className="p-2">Damaged</th>{canApprove && delivery.status === "Pending" && <th className="p-2">Approve Qty</th>}</tr>
              </thead>
              <tbody>
                {delivery.items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="p-2">{item.itemName}<br /><span className="text-xs text-muted-foreground">{item.sku}</span></td>
                    <td className="p-2 text-center">{item.quantityDelivered}</td>
                    <td className="p-2 text-center">{item.quantityDamaged}</td>
                    {canApprove && delivery.status === "Pending" && (
                      <td className="p-2">
                        <Input
                          type="number"
                          className="h-8 w-20 mx-auto"
                          defaultValue={item.quantityDelivered}
                          onChange={(e) => setApprovals((a) => ({ ...a, [item.id]: { qty: Number(e.target.value), approved: true } }))}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {canApprove && delivery.status === "Pending" && (
          <Card>
            <CardHeader><CardTitle>Manager Approval</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Approving will add accepted quantities to live inventory.</p>
              <div className="space-y-2">
                <Label>Manager Notes</Label>
                <Input value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} placeholder="Optional notes" />
              </div>
              <Button className="w-full" onClick={() => approve.mutate("Approved")} disabled={approve.isPending}>Approve</Button>
              <Button variant="outline" className="w-full" onClick={() => approve.mutate("PartiallyApproved")} disabled={approve.isPending}>Partial Approval</Button>
              <Button variant="destructive" className="w-full" onClick={() => approve.mutate("Rejected")} disabled={approve.isPending}>Reject</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
