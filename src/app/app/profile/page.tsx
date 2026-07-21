"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  id: string;
  name: string;
  email: string;
  branch: string | null;
  year: number | null;
  role: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => apiFetch<Profile>("/api/me") });
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  // Tracks which profile's values are currently loaded into the form, so we can
  // sync form state from the fetched data exactly once (during render, not an
  // effect) without clobbering in-progress edits on unrelated re-renders.
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (data && data.id !== syncedId) {
    setSyncedId(data.id);
    setBranch(data.branch ?? "");
    setYear(data.year ? String(data.year) : "");
  }

  const save = useMutation({
    mutationFn: () => apiFetch("/api/me", { method: "PATCH", body: JSON.stringify({ branch, year: Number(year) }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (!data) return null;

  const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.email}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-5">
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 3" />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
