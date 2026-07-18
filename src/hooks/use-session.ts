// Placeholder for Task 4 (app shell layout). Task 5 will replace this with the
// real session hook (auth state, user profile, role) backed by the API client.
type SessionUser = { role: "student" | "admin" } | null;

export function useSession(): { user: SessionUser } {
  return { user: null };
}
