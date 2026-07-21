import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PdfViewer } from "./PdfViewer";

vi.mock("react-pdf", () => ({
  Document: ({
    children,
    onLoadSuccess,
  }: {
    children: React.ReactNode;
    onLoadSuccess?: (info: { numPages: number }) => void;
  }) => {
    onLoadSuccess?.({ numPages: 3 });
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber }: { pageNumber: number }) => (
    <div data-testid={`pdf-page-${pageNumber}`} />
  ),
  pdfjs: { GlobalWorkerOptions: {} },
}));

describe("PdfViewer", () => {
  it("renders the first page and page count after load", async () => {
    render(<PdfViewer fileUrl="https://example.com/file.pdf" />);

    expect(await screen.findByTestId("pdf-page-1")).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
  });
});
