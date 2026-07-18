"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { MaterialSummary } from "@/components/materials/MaterialCard";

export interface SearchParams {
  q?: string;
  courseId?: string;
  type?: string;
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params.q) qs.set("q", params.q);
      if (params.courseId) qs.set("course_id", params.courseId);
      if (params.type) qs.set("type", params.type);
      return apiFetch<MaterialSummary[]>(`/api/search?${qs.toString()}`);
    },
    enabled: Boolean(params.q),
    placeholderData: keepPreviousData,
  });
}

export function useCourses(branch?: string, year?: number, semester?: number) {
  return useQuery({
    queryKey: ["courses", branch, year, semester],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (branch) qs.set("branch", branch);
      if (year) qs.set("year", String(year));
      if (semester) qs.set("semester", String(semester));
      return apiFetch<{ id: string; name: string }[]>(`/api/courses?${qs.toString()}`);
    },
    enabled: Boolean(branch && year && semester),
  });
}
