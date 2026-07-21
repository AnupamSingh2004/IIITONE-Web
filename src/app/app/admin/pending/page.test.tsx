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
});
