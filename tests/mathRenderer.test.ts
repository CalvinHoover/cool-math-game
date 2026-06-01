import { describe, expect, it } from "vitest";
import { renderMath, renderMathInline } from "@/features/questions/mathRenderer";

describe("renderMath", () => {
  it("renders math text", () => {
    const html = renderMath("hello");
    expect(html).toBeTruthy();
  });

  it("returns a string", () => {
    const html = renderMath("$x^2$");
    expect(typeof html).toBe("string");
  });
});

describe("renderMathInline", () => {
  it("renders inline math", () => {
    const html = renderMathInline("hello");
    expect(html).toBeTruthy();
  });
});
