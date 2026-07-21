"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PendingMaterial {
  id: string;
  title: string;
  type: string;
  courseName: string;
}

export default function AdminPendingPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "pending"],
    queryFn: () => apiFetch<PendingMaterial[]>("/api/admin/materials/pending"),
  });

  const approve = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/materials/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending"] });
      toast("Approved");
    },
    onError: () => toast.error("Failed to approve"),
  });
  const reject = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/materials/${id}/reject`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending"] });
      toast("Rejected and removed");
    },
    onError: () => toast.error("Failed to reject"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pending review</h1>
      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load the pending queue. Try refreshing.</p>
      )}
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && !isError && data.length === 0 && (
        <p className="text-muted-foreground">Nothing waiting for review.</p>
      )}
      <div className="divide-y divide-border rounded-lg border border-border">
        {data.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{m.title}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{m.type}</Badge>
                <span>{m.courseName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={approve.isPending || reject.isPending}
                onClick={() => approve.mutate(m.id)}
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-destructive hover:bg-destructive/10"
                disabled={approve.isPending || reject.isPending}
                onClick={() => reject.mutate(m.id)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
