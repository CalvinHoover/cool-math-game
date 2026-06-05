import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Navbar", () => {
  it("renders username and logout button", () => {
    render(<Navbar username="alice" />);
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Navbar username="bob" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Practice")).toBeInTheDocument();
  });
});
