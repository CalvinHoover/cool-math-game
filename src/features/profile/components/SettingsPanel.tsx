"use client";

import { UserSettings } from "../types"

type SettingsProps = {
    settings: UserSettings;
    onChange: (updatedSettings: UserSettings) => void;
};

export default function SettingsPanel({
    settings: _settings, onChange: _onChange,
}: SettingsProps) {
    return (
        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-xl font-bold"> Settings </h2>
            <div className="mt-4 space-y-4">
                <label className="flex gap-2 text-gray-600 dark:text-gray-300">
                    <input
                        type="checkbox"
                        checked={false}
                        disabled
                    /> Show Match History
                </label>
            </div>
        </section>
    )
};
