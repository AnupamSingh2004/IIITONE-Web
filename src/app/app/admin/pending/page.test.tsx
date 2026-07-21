import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminPendingPage from "./page";
import * as apiClient from "@/lib/api-client";

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AdminPendingPage", () => {
  it("lists pending materials and approves one on click", async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, "apiFetch")
      .mockImplementation(async <T,>(path: string) => {
        if (path === "/api/admin/materials/pending") {
          return [{ id: "m1", title: "Pending Notes", type: "notes", courseName: "OS" }] as T;
        }
        return undefined as T;
      });

    renderWithProviders(<AdminPendingPage />);

    expect(await screen.findByText("Pending Notes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(apiFetchSpy).toHaveBeenCalledWith(
        "/api/admin/materials/m1/approve",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("rejects a pending material on click", async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, "apiFetch")
      .mockImplementation(async <T,>(path: string) => {
        if (path === "/api/admin/materials/pending") {
          return [{ id: "m1", title: "Pending Notes", type: "notes", courseName: "OS" }] as T;
        }
        return undefined as T;
      });

    renderWithProviders(<AdminPendingPage />);

    expect(await screen.findByText("Pending Notes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    await waitFor(() => {
      expect(apiFetchSpy).toHaveBeenCalledWith(
        "/api/admin/materials/m1/reject",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows an error state if the queue fails to load", async () => {
    vi.spyOn(apiClient, "apiFetch").mockRejectedValue(new apiClient.ApiError(500, "server error"));

    renderWithProviders(<AdminPendingPage />);

    expect(await screen.findByText(/couldn.t load the pending queue/i)).toBeInTheDocument();
  });

  it("only disables the row being acted on, not the whole queue", async () => {
    vi.spyOn(apiClient, "apiFetch").mockImplementation(async <T,>(path: string, init?: RequestInit) => {
      if (path === "/api/admin/materials/pending") {
        return [
          { id: "m1", title: "First", type: "notes", courseName: "OS" },
          { id: "m2", title: "Second", type: "notes", courseName: "OS" },
        ] as T;
      }
      if (init?.method === "POST") {
        return new Promise(() => {}) as T; // never resolves, keeps this row's mutation pending
      }
      return undefined as T;
    });

    renderWithProviders(<AdminPendingPage />);

    expect(await screen.findByText("First")).toBeInTheDocument();
    const approveButtons = screen.getAllByRole("button", { name: /^approve$/i });

    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /approving/i })).toBeDisabled();
    });
    // The second row's Approve button must remain enabled and unaffected.
    expect(screen.getByRole("button", { name: /^approve$/i })).not.toBeDisabled();
  });
});
