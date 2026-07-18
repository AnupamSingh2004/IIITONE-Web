"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/app");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") return null;
  return <>{children}</>;
}
