"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import api from "@/lib/api";
import type { Notification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<Notification[]>("/notifications?unreadOnly=true")).data,
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="relative">
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
        {data.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
            {data.length}
          </span>
        )}
      </Button>
      {data.length > 0 && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card p-2 shadow-xl">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Notifications</p>
          {data.slice(0, 5).map((n) => (
            <button
              key={n.id}
              type="button"
              className="w-full rounded-lg p-2 text-left hover:bg-muted"
              onClick={() => markRead.mutate(n.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <Badge variant="warning" className="shrink-0">New</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
