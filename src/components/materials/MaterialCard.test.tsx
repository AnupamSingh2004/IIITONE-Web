import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaterialCard } from "./MaterialCard";

describe("MaterialCard", () => {
  it("renders title, type badge, and links to the detail page", () => {
    render(
      <MaterialCard material={{ id: "m1", title: "OS Deadlock Notes", type: "notes", courseName: "Operating Systems", hasTextLayer: true }} />
    );

    expect(screen.getByText("OS Deadlock Notes")).toBeInTheDocument();
    // Exact match on the badge text — the title itself contains the
    // substring "Notes", so a loose /notes/i match would be ambiguous.
    expect(screen.getByText("notes")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/app/materials/m1");
  });
});
