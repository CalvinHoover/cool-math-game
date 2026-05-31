// wrapper to toggle between light and dark theme for profile
// temporary ugly solution until i figure out how to make this not blinding

"use client";

import { useState } from "react";

interface ThemeToggleWrapperProps {
  children: React.ReactNode;
}

export default function ThemeToggleWrapper({ children }: ThemeToggleWrapperProps) {
  const [isDark, setIsDark] = useState(true);

  return (
    <main
      className={`min-h-screen p-6 transition ${
        isDark ? "dark bg-gray-950 text-white" : "bg-white text-black"
      }`}
    >
      {/* <button
        onClick={() => setIsDark(!isDark)}
        className="mb-4 rounded-lg border px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
        {isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      </button> */}
      {children}
    </main>
  );
}