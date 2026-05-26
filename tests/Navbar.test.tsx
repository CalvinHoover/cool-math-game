import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";

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
