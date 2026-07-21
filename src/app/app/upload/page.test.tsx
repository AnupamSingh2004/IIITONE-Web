import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UploadPage, { validateUploadFile } from "./page";
import * as useSessionModule from "@/hooks/use-session";
import * as apiClient from "@/lib/api-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <UploadPage />
    </QueryClientProvider>
  );
}

function pdfFile(name = "notes.pdf", size = 1024) {
  const file = new File([new Uint8Array(size)], name, { type: "application/pdf" });
  return file;
}

describe("validateUploadFile", () => {
  it("rejects non-PDF files", () => {
    const file = new File(["x"], "notes.zip", { type: "application/zip" });
    expect(validateUploadFile(file)).toMatch(/pdf/i);
  });

  it("rejects files over the size limit", () => {
    const file = pdfFile("big.pdf", 51 * 1024 * 1024);
    expect(validateUploadFile(file)).toMatch(/too large/i);
  });

  it("accepts a well-formed PDF within the size limit", () => {
    expect(validateUploadFile(pdfFile())).toBeNull();
  });
});

describe("UploadPage drag-and-drop", () => {
  beforeEach(() => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: { id: "u1", email: "a@iiitdmj.ac.in", name: "A", role: "student", branch: "CSE", year: 3 },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);
    vi.spyOn(apiClient, "apiFetch").mockResolvedValue([]);
  });

  it("accepts a dropped PDF and displays its name", () => {
    renderPage();
    const dropZone = screen.getByText(/drag & drop a pdf/i).closest("label")!;

    fireEvent.drop(dropZone, { dataTransfer: { files: [pdfFile("dropped.pdf")] } });

    expect(screen.getByText("dropped.pdf")).toBeInTheDocument();
  });

  it("rejects a dropped non-PDF file without setting it", () => {
    renderPage();
    const dropZone = screen.getByText(/drag & drop a pdf/i).closest("label")!;
    const badFile = new File(["x"], "notes.zip", { type: "application/zip" });

    fireEvent.drop(dropZone, { dataTransfer: { files: [badFile] } });

    expect(screen.queryByText("notes.zip")).not.toBeInTheDocument();
    expect(screen.getByText(/drag & drop a pdf/i)).toBeInTheDocument();
  });

  it("toggles the active-drag visual state on dragOver/dragLeave", () => {
    renderPage();
    const dropZone = screen.getByText(/drag & drop a pdf/i).closest("label")!;

    fireEvent.dragOver(dropZone);
    expect(dropZone.classList.contains("border-primary")).toBe(true);

    fireEvent.dragLeave(dropZone);
    expect(dropZone.classList.contains("border-primary")).toBe(false);
  });
});

describe("UploadPage incomplete profile", () => {
  it("shows a message and keeps submit disabled when branch/year are missing", () => {
    vi.spyOn(useSessionModule, "useSession").mockReturnValue({
      user: { id: "u1", email: "a@iiitdmj.ac.in", name: "A", role: "student" },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useSessionModule.useSession>);
    vi.spyOn(apiClient, "apiFetch").mockResolvedValue([]);

    renderPage();

    expect(screen.getByText(/add your branch and year/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });
});
