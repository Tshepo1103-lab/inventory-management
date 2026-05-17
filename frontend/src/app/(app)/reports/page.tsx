"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import api from "@/lib/api";
import type { ReportSummary } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const reports = [
  { key: "inventory", label: "Current Inventory", endpoint: "/reports/inventory" },
  { key: "low-stock", label: "Low Stock", endpoint: "/reports/low-stock" },
  { key: "valuation", label: "Stock Valuation", endpoint: "/reports/valuation" },
  { key: "deliveries", label: "Delivery History", endpoint: "/reports/deliveries" },
  { key: "wastage", label: "Wastage Report", endpoint: "/reports/wastage" },
];

function ReportCard({ endpoint, label }: { endpoint: string; label: string }) {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["report", endpoint],
    queryFn: async () => (await api.get<ReportSummary>(endpoint)).data,
    enabled: false,
  });

  const exportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label.replace(/\s/g, "-").toLowerCase()}.json`;
    a.click();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-gold" />{label}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Loading..." : "Generate"}
          </Button>
          {data && (
            <Button variant="ghost" size="sm" onClick={exportJson}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      {data && (
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">Generated {formatDate(data.generatedAt)} · {Array.isArray(data.data) ? data.data.length : 0} records</p>
          <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(data.data, null, 2).slice(0, 1500)}...</pre>
        </CardContent>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <AppShell title="Reports & Analytics">
      <p className="mb-6 text-muted-foreground">Generate and export inventory reports for operations and auditing.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => <ReportCard key={r.key} endpoint={r.endpoint} label={r.label} />)}
      </div>
    </AppShell>
  );
}
