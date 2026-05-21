import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MathText } from "@/components/math/MathText";

describe("MathText", () => {
  it("renders math text", () => {
    const { container } = render(<MathText text="hello" />);
    expect(container.textContent).toBeTruthy();
  });

  it("applies the provided className", () => {
    const { container } = render(<MathText text="hello" className="my-class" />);
    const span = container.querySelector("span");
    expect(span).toHaveClass("my-class");
  });
});
