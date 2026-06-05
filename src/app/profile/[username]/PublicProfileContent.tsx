"use client";

import { useState } from "react";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import SettingsPanel from "@/features/profile/components/SettingsPanel";
import FontSizeSelector from "@/features/profile/components/FontSizeSelector";
import type { UserProfile } from "@/features/profile/types";

interface PublicProfileContentProps {
  profile: UserProfile;
}

export default function PublicProfileContent({ profile }: PublicProfileContentProps) {
  const [localProfile, setLocalProfile] = useState(profile);

  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <main className={`space-y-6 ${fontSizeClasses[localProfile.settings.fontSize]}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader profile={localProfile} />

        <ProfileStats
          totalXp={localProfile.stats.xp}
          globalLevel={localProfile.stats.level}
          currentLevelXp={localProfile.stats.xp % 100}
          nextLevelXp={100}
          practiceSessionsCompleted={localProfile.stats.gamesCompleted}
        />

        {localProfile.settings.showMatchHistory && (
          <MatchHistoryList matches={[]} />
        )}

        <SettingsPanel
          settings={localProfile.settings}
          onChange={(updatedSettings) =>
            setLocalProfile({
              ...localProfile,
              settings: updatedSettings,
            })
          }
        />

        <FontSizeSelector
          fontSize={localProfile.settings.fontSize}
          onChange={(newFontSize) =>
            setLocalProfile({
              ...localProfile,
              settings: {
                ...localProfile.settings,
                fontSize: newFontSize,
              },
            })
          }
        />

        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Achievements</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            INSERT ACHIEVEMENTS HERE
          </p>
        </section>

        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Friends</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            INSERT FRIEND LIST HERE
          </p>
        </section>
      </div>
    </main>
  );
}
