"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import type { InventoryItem, PagedResult } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { formatCategory } from "@/lib/labels";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, search],
    queryFn: async () =>
      (await api.get<PagedResult<InventoryItem>>("/inventory", { params: { page, pageSize: 15, search: search || undefined } })).data,
  });

  return (
    <AppShell title="Inventory">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stock Items</CardTitle>
          <Button asChild><Link href="/inventory/new"><Plus className="h-4 w-4" /> Add Item</Link></Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-muted-foreground">
                  <th className="p-3">Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
                ))}
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-muted-foreground">{item.sku}</td>
                    <td className="p-3">{formatCategory(item.category)}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.unitType}</td>
                    <td className="p-3">{formatCurrency(item.costPrice)}</td>
                    <td className="p-3">
                      {item.isLowStock ? <Badge variant="warning">Low Stock</Badge> : <Badge variant="success">OK</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
