"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterState {
  q: string;
  type: string;
}

export function SearchFilters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes, PYQs, assignments..."
          className="pl-9"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />
      </div>
      <Select
        value={value.type}
        onValueChange={(type) => onChange({ ...value, type: type ?? "all" })}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="notes">Notes</SelectItem>
          <SelectItem value="pyq">PYQ</SelectItem>
          <SelectItem value="assignment">Assignment</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
