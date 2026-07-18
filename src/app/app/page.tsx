"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-materials";
import { SearchFilters, type FilterState } from "@/components/materials/SearchFilters";
import { MaterialCard } from "@/components/materials/MaterialCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({ q: "", type: "all" });
  const { data, isLoading } = useSearch({ q: filters.q, type: filters.type === "all" ? undefined : filters.type });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse materials</h1>
        <p className="text-muted-foreground">Find notes, PYQs, and assignments shared by your peers.</p>
      </div>
      <SearchFilters value={filters} onChange={setFilters} />

      {isLoading && filters.q && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      )}

      {!filters.q && (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          Start typing to search across course materials.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          No results for &quot;{filters.q}&quot;. Try a different keyword.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}
    </div>
  );
}
