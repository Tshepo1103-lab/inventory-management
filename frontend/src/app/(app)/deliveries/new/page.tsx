"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import type { InventoryItem, PagedResult, Supplier } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  supplierId: z.string().min(1),
  referenceNumber: z.string().min(1),
  deliveryDate: z.string().min(1),
  damagedNotes: z.string().optional(),
  receiverSignature: z.string().min(1),
  items: z.array(z.object({
    inventoryItemId: z.string().min(1),
    quantityDelivered: z.number().positive(),
    quantityDamaged: z.number().min(0),
    notes: z.string().optional(),
  })).min(1),
});

type FormData = z.infer<typeof schema>;

export default function NewDeliveryPage() {
  const router = useRouter();
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => (await api.get<PagedResult<Supplier>>("/suppliers", { params: { pageSize: 100 } })).data,
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => (await api.get<PagedResult<InventoryItem>>("/inventory", { params: { pageSize: 200 } })).data,
  });

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryDate: new Date().toISOString().split("T")[0],
      items: [{ inventoryItemId: "", quantityDelivered: 1, quantityDamaged: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/deliveries", data);
      if (invoiceFile) {
        const form = new FormData();
        form.append("file", invoiceFile);
        await api.post(`/deliveries/${res.data.id}/invoice`, form);
      }
      toast.success("Delivery submitted for manager approval");
      router.push(`/deliveries/${res.data.id}`);
    } catch {
      toast.error("Failed to create delivery");
    }
  };

  return (
    <AppShell title="Record Delivery">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <select {...register("supplierId")} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                <option value="">Select supplier</option>
                {suppliers?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input {...register("referenceNumber")} placeholder="DEL-2026-001" />
            </div>
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Input type="date" {...register("deliveryDate")} />
            </div>
            <div className="space-y-2">
              <Label>Receiver Signature</Label>
              <Input {...register("receiverSignature")} placeholder="Your full name" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Damaged Stock Notes</Label>
              <Input {...register("damagedNotes")} placeholder="Optional notes about damaged items" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Invoice / delivery note (optional)</Label>
              <Input type="file" accept="image/*,.pdf" onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Items Delivered</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ inventoryItemId: "", quantityDelivered: 1, quantityDamaged: 0 })}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Inventory Item</Label>
                  <select {...register(`items.${index}.inventoryItemId`)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                    <option value="">Select item</option>
                    {inventory?.items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Qty Delivered</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.quantityDelivered`, { valueAsNumber: true })} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Qty Damaged</Label>
                    <Input type="number" step="0.01" {...register(`items.${index}.quantityDamaged`, { valueAsNumber: true })} />
                  </div>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit for Approval"}</Button>
      </form>
    </AppShell>
  );
}
