"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

const MIN_YEAR = 1;
const MAX_YEAR = 6;

// A year outside this range (including empty/unparseable input) must never
// reach the save mutation — an empty field silently becomes 0 otherwise,
// which the backend would happily persist as a "successful" save.
function parseValidYear(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < MIN_YEAR || n > MAX_YEAR) return null;
  return n;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, isLoading } = useSession();
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  // Tracks which profile's values are currently loaded into the form, so we can
  // sync form state from the fetched data exactly once (during render, not an
  // effect) without clobbering in-progress edits on unrelated re-renders (e.g.
  // a background refetch of the shared ["me"] query while the user is typing).
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (user && user.id !== syncedId) {
    setSyncedId(user.id);
    setBranch(user.branch ?? "");
    setYear(user.year ? String(user.year) : "");
  }

  const validYear = parseValidYear(year);
  const canSave = branch.trim() !== "" && validYear !== null;

  const save = useMutation({
    mutationFn: () => {
      if (validYear === null) {
        throw new Error("invalid year");
      }
      return apiFetch("/api/me", { method: "PATCH", body: JSON.stringify({ branch, year: validYear }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
        Couldn&apos;t load your profile. Try refreshing the page.
      </div>
    );
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-5">
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 3"
          />
          {year.trim() !== "" && validYear === null && (
            <p className="text-sm text-destructive">Enter a year between {MIN_YEAR} and {MAX_YEAR}.</p>
          )}
        </div>
        <Button onClick={() => save.mutate()} disabled={!canSave || save.isPending}>
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
