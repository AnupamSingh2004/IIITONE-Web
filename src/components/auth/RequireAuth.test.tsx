import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequireAuth } from "./RequireAuth";
import * as useSessionModule from "@/hooks/use-session";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("redirects to / when not loading and no user", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: null,
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>
    );

    expect(replace).toHaveBeenCalledWith("/");
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("renders children once authenticated, without redirecting", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: { id: "u1", email: "a@iiitdmj.ac.in", name: "A", role: "student" },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("shows a loading state and does not redirect while session is loading", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: null,
      isLoading: true,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);

    render(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });
});
