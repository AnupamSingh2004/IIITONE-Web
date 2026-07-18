"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/app" className="text-lg font-semibold tracking-tight">
            IIIT<span className="text-primary">One</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/app/upload" />}>
              Upload
            </Button>
            {user?.role === "admin" && (
              <>
                <Button variant="ghost" render={<Link href="/app/admin/pending" />}>
                  Pending
                </Button>
                <Button variant="ghost" render={<Link href="/app/admin/flags" />}>
                  Flags
                </Button>
              </>
            )}
            <Button variant="ghost" render={<Link href="/app/profile" />}>
              Profile
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
