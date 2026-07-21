import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfilePage from "./page";
import * as apiClient from "@/lib/api-client";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function mockMe(overrides: Partial<Record<string, unknown>> = {}) {
  vi.spyOn(apiClient, "apiFetch").mockImplementation((async (path: string) => {
    if (path === "/api/me") {
      return { id: "u1", name: "Test User", email: "t@iiitdmj.ac.in", branch: "CSE", year: 3, role: "student", ...overrides };
    }
    return undefined;
  }) as typeof apiClient.apiFetch);
}

describe("ProfilePage", () => {
  it("loads and displays the current profile, and saves edits with the correct PATCH body", async () => {
    mockMe();

    renderWithClient(<ProfilePage />);

    expect(await screen.findByDisplayValue("CSE")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/branch/i), { target: { value: "ECE" } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "4" } });

    const saveSpy = vi.spyOn(apiClient, "apiFetch");
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        "/api/me",
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ branch: "ECE", year: 4 }) })
      );
    });
  });

  it("disables save and shows an inline error when year is cleared", async () => {
    mockMe();

    renderWithClient(<ProfilePage />);

    expect(await screen.findByDisplayValue("CSE")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "" } });

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("disables save and shows an inline error when year is out of range", async () => {
    mockMe();

    renderWithClient(<ProfilePage />);

    expect(await screen.findByDisplayValue("CSE")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "99" } });

    expect(screen.getByText(/enter a year between/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("shows an error state if the profile fails to load", async () => {
    vi.spyOn(apiClient, "apiFetch").mockRejectedValue(new apiClient.ApiError(500, "server error"));

    renderWithClient(<ProfilePage />);

    expect(await screen.findByText(/couldn.t load your profile/i)).toBeInTheDocument();
  });
});
