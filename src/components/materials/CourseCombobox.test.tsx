import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CourseCombobox } from "./CourseCombobox";

describe("CourseCombobox", () => {
  it("lets the user type a name not in the list and treats it as a new course", () => {
    const onChange = vi.fn();
    render(
      <CourseCombobox
        courses={[{ id: "c1", name: "Operating Systems" }]}
        value={null}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Compiler Design" } });
    fireEvent.click(screen.getByText(/add "compiler design"/i));

    expect(onChange).toHaveBeenCalledWith({ id: null, name: "Compiler Design" });
  });

  it("selecting an existing course passes its id", () => {
    const onChange = vi.fn();
    render(
      <CourseCombobox
        courses={[{ id: "c1", name: "Operating Systems" }]}
        value={null}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Operating" } });
    fireEvent.click(screen.getByText("Operating Systems"));

    expect(onChange).toHaveBeenCalledWith({ id: "c1", name: "Operating Systems" });
  });
});
