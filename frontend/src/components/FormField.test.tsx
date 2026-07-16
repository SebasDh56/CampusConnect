// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormField } from "./FormField";

afterEach(cleanup);

describe("FormField", () => {
  it("connects validation feedback to its input", () => {
    render(<FormField label="Documento" name="document_number" error="El documento es obligatorio." />);

    const input = screen.getByRole("textbox", { name: "Documento" });
    const error = screen.getByText("El documento es obligatorio.");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("document_number-error");
    expect(error.id).toBe("document_number-error");
  });

  it("preserves helper text when a select also has a validation error", () => {
    render(
      <>
        <p id="status-help">Selecciona el estado actual.</p>
        <FormField
          as="select"
          label="Estado"
          name="status"
          aria-describedby="status-help"
          error="Selecciona un estado."
          options={[{ label: "Selecciona", value: "" }]}
        />
      </>,
    );

    const select = screen.getByRole("combobox", { name: "Estado" });

    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.getAttribute("aria-describedby")).toBe("status-help status-error");
  });
});
