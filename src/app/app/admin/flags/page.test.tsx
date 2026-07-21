import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminFlagsPage from "./page";
import * as apiClient from "@/lib/api-client";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AdminFlagsPage", () => {
  it("lists open flags and bans the uploader independently of resolving the flag", async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, "apiFetch")
      .mockImplementation(async <T,>(path: string) => {
        if (path === "/api/admin/flags") {
          return [{ id: "f1", materialId: "m1", materialTitle: "Bad upload", uploaderId: "u1", reason: "wrong course" }] as T;
        }
        return undefined as T;
      });

    renderWithClient(<AdminFlagsPage />);

    expect(await screen.findByText("Bad upload")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ban uploader/i }));

    await waitFor(() => {
      expect(apiFetchSpy).toHaveBeenCalledWith("/api/admin/users/u1/ban", expect.objectContaining({ method: "POST" }));
    });
  });

  it("shows an error state if the flags queue fails to load", async () => {
    vi.spyOn(apiClient, "apiFetch").mockRejectedValue(new apiClient.ApiError(500, "server error"));

    renderWithClient(<AdminFlagsPage />);

    expect(await screen.findByText(/couldn.t load/i)).toBeInTheDocument();
  });
});
