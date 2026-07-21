import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfilePage from "./page";
import * as apiClient from "@/lib/api-client";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ProfilePage", () => {
  it("loads and displays the current profile, and saves edits", async () => {
    vi.spyOn(apiClient, "apiFetch").mockImplementation((async (path: string) => {
      if (path === "/api/me") return { id: "u1", name: "Test User", email: "t@iiitdmj.ac.in", branch: "CSE", year: 3, role: "student" };
      return undefined;
    }) as typeof apiClient.apiFetch);

    renderWithClient(<ProfilePage />);

    expect(await screen.findByDisplayValue("CSE")).toBeInTheDocument();

    const saveSpy = vi.spyOn(apiClient, "apiFetch");
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith("/api/me", expect.objectContaining({ method: "PATCH" }));
    });
  });
});
