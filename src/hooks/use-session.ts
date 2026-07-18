"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  branch?: string;
  year?: number;
}

export function useSession() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await apiFetch<User>("/api/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
  });

  return { user: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}
