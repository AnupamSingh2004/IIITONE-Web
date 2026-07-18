import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiFetch, ApiError } from "./api-client";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "abc" }),
    }));

    const result = await apiFetch<{ id: string }>("/api/me");
    expect(result.id).toBe("abc");
  });

  it("throws ApiError with status and message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "account is not a verified college account",
    }));

    await expect(apiFetch("/api/me")).rejects.toBeInstanceOf(ApiError);
  });

  it("always sends credentials so the httpOnly session cookie is included", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/api/me");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/me"),
      expect.objectContaining({ credentials: "include" })
    );
  });
});
