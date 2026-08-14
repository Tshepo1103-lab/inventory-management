"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { PagedResult, Supplier } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  category: z.string().min(1),
  quantity: z.coerce.number().min(0),
  unitType: z.string().min(1),
  supplierId: z.string().min(1, "Supplier is required"),
  costPrice: z.coerce.number().min(0),
  sellingEstimate: z.coerce.number().min(0),
  minimumThreshold: z.coerce.number().min(0),
  expiryDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const categories = [
  "Meat",
  "Alcohol",
  "CleaningSupplies",
  "Beverages",
  "Vegetables",
  "Packaging",
  "Miscellaneous",
];

const units = ["Kg", "Litres", "Bottles", "Crates", "Boxes", "Units"];

export default function NewInventoryPage() {
  const router = useRouter();
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => (await api.get<PagedResult<Supplier>>("/suppliers", { params: { pageSize: 100 } })).data,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 0, costPrice: 0, sellingEstimate: 0, minimumThreshold: 0, category: "Meat", unitType: "Kg" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/inventory", {
        ...data,
        barcode: data.barcode || null,
        expiryDate: data.expiryDate || null,
      });
      toast.success("Inventory item created");
      router.push("/inventory");
    } catch {
      toast.error("Could not create item. Check SKU is unique.");
    }
  };

  return (
    <AppShell title="Add Inventory Item">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>New stock item</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Beef Short Ribs" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register("sku")} placeholder="MEAT-010" />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Barcode (optional)</Label>
              <Input {...register("barcode")} />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <select {...register("supplierId")} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                <option value="">Select supplier</option>
                {suppliers?.items.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.supplierId && <p className="text-xs text-red-500">{errors.supplierId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select {...register("category")} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                {categories.map((c) => <option key={c} value={c}>{c.replace(/([A-Z])/g, " $1").trim()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <select {...register("unitType")} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Opening quantity</Label>
              <Input type="number" step="0.01" {...register("quantity")} />
            </div>
            <div className="space-y-2">
              <Label>Minimum threshold</Label>
              <Input type="number" step="0.01" {...register("minimumThreshold")} />
            </div>
            <div className="space-y-2">
              <Label>Cost price (ZAR)</Label>
              <Input type="number" step="0.01" {...register("costPrice")} />
            </div>
            <div className="space-y-2">
              <Label>Selling estimate (ZAR)</Label>
              <Input type="number" step="0.01" {...register("sellingEstimate")} />
            </div>
            <div className="space-y-2">
              <Label>Expiry date (optional)</Label>
              <Input type="date" {...register("expiryDate")} />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save item"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}
