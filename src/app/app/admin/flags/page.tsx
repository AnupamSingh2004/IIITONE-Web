"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShieldOff } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OpenFlag {
  id: string;
  materialId: string;
  materialTitle: string;
  uploaderId: string;
  reason: string;
}

export default function AdminFlagsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "flags"],
    queryFn: () => apiFetch<OpenFlag[]>("/api/admin/flags"),
  });

  const resolveAndRemove = useMutation({
    mutationFn: (flag: OpenFlag) =>
      apiFetch(`/api/admin/flags/${flag.id}/resolve?material_id=${flag.materialId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flags"] });
      toast("Material removed, flag resolved");
    },
    onError: () => toast.error("Failed to remove material"),
  });
  const ban = useMutation({
    mutationFn: (uploaderId: string) => apiFetch(`/api/admin/users/${uploaderId}/ban`, { method: "POST" }),
    onSuccess: () => toast("User banned"),
    onError: () => toast.error("Failed to ban user"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reported content</h1>
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load reported content. Try refreshing.</p>}
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && !isError && data.length === 0 && <p className="text-muted-foreground">No open reports.</p>}
      <div className="divide-y divide-border rounded-lg border border-border">
        {data.map((f) => {
          const removingThis = resolveAndRemove.isPending && resolveAndRemove.variables?.id === f.id;
          const banningThis = ban.isPending && ban.variables === f.uploaderId;
          return (
            <div key={f.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{f.materialTitle}</p>
                <p className="text-sm text-muted-foreground">Reason: {f.reason}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={removingThis}
                  onClick={() => resolveAndRemove.mutate(f)}
                >
                  <Trash2 className="h-4 w-4" /> {removingThis ? "Removing..." : "Remove material"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-destructive hover:bg-destructive/10"
                  disabled={banningThis}
                  onClick={() => ban.mutate(f.uploaderId)}
                >
                  <ShieldOff className="h-4 w-4" /> {banningThis ? "Banning..." : "Ban uploader"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
