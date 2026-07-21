"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export interface CourseOption {
  id: string;
  name: string;
}
export interface CourseSelection {
  id: string | null;
  name: string;
}

export function CourseCombobox({
  courses,
  value,
  onChange,
}: {
  courses: CourseOption[];
  value: CourseSelection | null;
  onChange: (selection: CourseSelection) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);

  const matches = courses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const exactMatch = courses.some((c) => c.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative">
      <Input
        role="combobox"
        aria-expanded={open}
        placeholder="Search or add a course..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card p-1 shadow-md">
          {matches.map((c) => (
            <button
              key={c.id}
              type="button"
              className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => {
                onChange({ id: c.id, name: c.name });
                setQuery(c.name);
                setOpen(false);
              }}
            >
              {c.name}
            </button>
          ))}
          {!exactMatch && query.trim() && (
            <button
              type="button"
              className="block w-full rounded px-3 py-2 text-left text-sm text-primary hover:bg-accent"
              onClick={() => {
                onChange({ id: null, name: query.trim() });
                setOpen(false);
              }}
            >
              Add &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
