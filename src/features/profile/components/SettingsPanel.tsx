"use client";

import { useState } from "react";
import { UserSettings } from "../types"

type SettingsProps = {
    settings: UserSettings;
    onChange: (updatedSettings: UserSettings) => void;
};

export default function SettingsPanel({
    settings, onChange,
}: SettingsProps) {
    const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
    const [publicProfile, setPublicProfile] = useState(settings.publicProfile);
    const [showMatchHistory, setShowMatchHistory] = useState(settings.showMatchHistory);

    return (
        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-xl font-bold"> Settings </h2>
            <div className="mt-4 space-y-4">
                <label className="flex gap-2">
                    <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)} /> Email Notifications 
                </label>
                <label className="flex gap-2">
                    <input
                        type="checkbox"
                        checked={publicProfile}
                        onChange={() => setPublicProfile(!publicProfile)} /> Public Profile
                </label>
                <label className="flex gap-2">
                    <input
                        type="checkbox"
                        checked={settings.showMatchHistory}
                        onChange={() => 
                            onChange({
                                ...settings,
                                showMatchHistory: !settings.showMatchHistory,
                            })
                        } /> Show Match History
                </label>
            </div>
        </section>
    )
};
