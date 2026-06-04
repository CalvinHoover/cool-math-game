"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import SettingsPanel from "@/features/profile/components/SettingsPanel";
import FontSizeSelector from "@/features/profile/components/FontSizeSelector";
import { testUserProfiles } from "@/features/profile/testData";

export default function ProfileUsernamePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const foundProfile = testUserProfiles.find(
    (user) => user.username === username
  );

  if (!foundProfile) {
    return (
      <main className="p-6 text-white">
        <p>User not found.</p>
      </main>
    );
  }

  const [profile, setProfile] = useState(foundProfile);

  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <main className={`space-y-6 ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader profile={profile} />

        <ProfileStats
          totalXp={profile.stats.xp}
          globalLevel={profile.stats.level}
          currentLevelXp={profile.stats.xp % 100}
          nextLevelXp={100}
          practiceSessionsCompleted={profile.stats.gamesCompleted}
        />

        {profile.settings.showMatchHistory && (
          <MatchHistoryList matches={[]} />
        )}

        <SettingsPanel
          settings={profile.settings}
          onChange={(updatedSettings) =>
            setProfile({
              ...profile,
              settings: updatedSettings,
            })
          }
        />

        <FontSizeSelector
          fontSize={profile.settings.fontSize}
          onChange={(newFontSize) =>
            setProfile({
              ...profile,
              settings: {
                ...profile.settings,
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