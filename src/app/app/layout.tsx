import { AppShell } from "@/components/layout/AppShell";

// TODO(Task 5): wrap with RequireAuth once auth guards land.
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>{children}</AppShell>
  );
}
