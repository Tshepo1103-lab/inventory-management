"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Phone, Mail } from "lucide-react";
import api from "@/lib/api";
import type { PagedResult, Supplier } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", search],
    queryFn: async () =>
      (await api.get<PagedResult<Supplier>>("/suppliers", { params: { page: 1, pageSize: 50, search: search || undefined } })).data,
  });

  return (
    <AppShell title="Suppliers">
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        {data?.items.map((s) => (
          <Card key={s.id} className="hover:border-gold/30 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <Badge variant={s.isActive ? "success" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{s.contactPerson}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{s.phone}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{s.email}</p>
              <p className="text-muted-foreground">{s.address}</p>
              <p className="pt-2 text-xs text-gold">{s.deliveryCount} deliveries recorded</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
