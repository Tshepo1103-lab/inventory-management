"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Printer } from "lucide-react";
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

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
}

function ReportCard({ endpoint, label }: { endpoint: string; label: string }) {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["report", endpoint],
    queryFn: async () => (await api.get<ReportSummary>(endpoint)).data,
    enabled: false,
  });

  const rows = Array.isArray(data?.data) ? (data.data as Record<string, unknown>[]) : [];

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label.replace(/\s/g, "-").toLowerCase()}.csv`;
    a.click();
  };

  const printReport = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<title>${label}</title><h1>${label}</h1><pre>${JSON.stringify(rows, null, 2)}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-gold" />{label}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Loading..." : "Generate"}
          </Button>
          {rows.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={printReport}><Printer className="h-4 w-4" /></Button>
            </>
          )}
        </div>
      </CardHeader>
      {data && (
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">Generated {formatDate(data.generatedAt)} · {rows.length} records</p>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records for this report.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    {Object.keys(rows[0]).map((key) => <th key={key} className="p-2 text-left">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.keys(rows[0]).map((key) => <td key={key} className="p-2">{String(row[key] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <AppShell title="Reports & Analytics">
      <p className="mb-6 text-muted-foreground">Generate printable operations reports. Export as CSV for Excel.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => <ReportCard key={r.key} endpoint={r.endpoint} label={r.label} />)}
      </div>
    </AppShell>
  );
}
