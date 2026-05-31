"use client";

import { useState } from "react";
import type { UserSettings } from "../types";

type FontSize = UserSettings["fontSize"];

type FontSizeProps = {
    fontSize: FontSize;
    onChange: (fontSize: FontSize) => void;
};

const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
}

export default function FontSizeSelector({
    fontSize, onChange,
}: FontSizeProps) {
    const [selectedFontSize, setSelectedFontSize] = useState(fontSize);

    return (
        <section className={`border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${fontSizeClasses[selectedFontSize]}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white"> Font Size </h2>

            {/* <p className="mt-2 text-gray-600 dark:text-gray-300"> This text will change size. </p> */}
            <div className="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
                {(["small", "medium", "large"] as const).map((size) => (
                    <label key={size} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="fontSize"
                            value={size}
                            checked={fontSize === size}
                            onChange={() => onChange(size)}
                        />
                        {size}
                    </label>
                ))}
            </div>
        </section>
    )
}