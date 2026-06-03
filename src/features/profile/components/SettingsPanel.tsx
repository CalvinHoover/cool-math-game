"use client";

import { UserSettings } from "../types";

type SettingsProps = {
  settings: UserSettings;
  onChange: (updatedSettings: UserSettings) => void;
};

export default function SettingsPanel({ settings, onChange }: SettingsProps) {
  return (
    <section className="profile-section">
      <h2>Settings</h2>

      <div className="profile-form">
        <label className="profile-checkbox-row">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={() =>
              onChange({
                ...settings,
                emailNotifications: !settings.emailNotifications,
              })
            }
          />
          Email Notifications
        </label>

        <label className="profile-checkbox-row">
          <input
            type="checkbox"
            checked={settings.publicProfile}
            onChange={() =>
              onChange({
                ...settings,
                publicProfile: !settings.publicProfile,
              })
            }
          />
          Public Profile
        </label>

        <label className="profile-checkbox-row">
          <input
            type="checkbox"
            checked={settings.showMatchHistory}
            onChange={() =>
              onChange({
                ...settings,
                showMatchHistory: !settings.showMatchHistory,
              })
            }
          />
          Show Match History
        </label>
      </div>
    </section>
  );
}