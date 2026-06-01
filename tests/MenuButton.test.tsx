import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuButton } from "@/components/interface/MenuButton";

vi.mock("@/lib/audio", () => ({
  playClick: () => {},
  playHover: () => {},
}));

describe("MenuButton", () => {
  it("renders label and handles click", () => {
    const onClick = vi.fn();
    render(<MenuButton label="Open" onClick={onClick} />);
    const btn = screen.getByText("Open");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
