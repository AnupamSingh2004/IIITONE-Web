"use client";

import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 text-center">
      <div className="animate-slide-up space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          IIIT<span className="text-primary">One</span>
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Notes, PYQs, and course material — shared by IIITDMJ students, for IIITDMJ students.
        </p>
        <Button size="lg" onClick={() => (window.location.href = `${API_URL}/auth/google/login`)}>
          Sign in with your @iiitdmj.ac.in account
        </Button>
      </div>
    </div>
  );
}
