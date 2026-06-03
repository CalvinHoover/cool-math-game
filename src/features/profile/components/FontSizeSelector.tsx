"use client";

import { useState } from "react";
import type { UserSettings } from "../types";

type FontSize = UserSettings["fontSize"];

type FontSizeProps = {
    fontSize: FontSize;
    onChange: (fontSize: FontSize) => void;
};

// const fontSizeClasses = {
//     small: "text-sm",
//     medium: "text-base",
//     large: "text-lg",
// }

export default function FontSizeSelector({
    fontSize, onChange,
}: FontSizeProps) {
    // const [selectedFontSize, setSelectedFontSize] = useState(fontSize);

    return (
        <section className="profile-section">
            <h2> Font Size </h2>

            {/* <p className="mt-2 text-gray-600 dark:text-gray-300"> This text will change size. </p> */}
            <div className="profile-form">
                {(["small", "medium", "large"] as const).map((size) => (
                    <label key={size} className="profile-checkbox-row">
                        <input
                            type="radio"
                            name="fontSize"
                            value={size}
                            checked={fontSize === size}
                            onChange={() => onChange(size)}
                        />

                        <span className="profile-value">
                            {size} 
                        </span>
                    </label>
                ))}
            </div>
        </section>
    )
}