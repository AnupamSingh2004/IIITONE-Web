import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequireAdmin } from "./RequireAdmin";
import * as useSessionModule from "@/hooks/use-session";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("RequireAdmin", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("redirects to /app when the user is not an admin", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: { id: "u1", email: "a@iiitdmj.ac.in", name: "A", role: "student" },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAdmin>
        <div>admin-only</div>
      </RequireAdmin>
    );

    expect(replace).toHaveBeenCalledWith("/app");
    expect(screen.queryByText("admin-only")).not.toBeInTheDocument();
  });

  it("redirects to /app when there is no user at all", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: null,
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAdmin>
        <div>admin-only</div>
      </RequireAdmin>
    );

    expect(replace).toHaveBeenCalledWith("/app");
  });

  it("renders children for an admin user, without redirecting", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: { id: "u1", email: "a@iiitdmj.ac.in", name: "A", role: "admin" },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAdmin>
        <div>admin-only</div>
      </RequireAdmin>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText("admin-only")).toBeInTheDocument();
  });
});
