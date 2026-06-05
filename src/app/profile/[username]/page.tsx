"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import EditProfile from "@/features/profile/components/EditProfile";
import SettingsPanel from "@/features/profile/components/SettingsPanel";
import FontSizeSelector from "@/features/profile/components/FontSizeSelector";
import { testUserProfiles } from "@/features/profile/testData";
import type { PastMatch } from "@/features/profile/types";

export default function ProfileUsernamePage() {
  const params  = useParams<{ username: string }>();
  const username = params.username;

  const foundProfile = testUserProfiles.find((u) => u.username === username);

  const [profile,     setProfile]     = useState(foundProfile);
  const [realMatches, setRealMatches] = useState<PastMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${username}/matches`)
      .then((res) => res.json())
      .then((data: PastMatch[]) => setRealMatches(data))
      .catch(console.error)
      .finally(() => setLoadingMatches(false));
  }, [username]);

  if (!profile) {
    return (
      <main className="p-6 text-white">
        <p>User not found.</p>
      </main>
    );
  }

  const fontSizeClasses = {
    small:  "text-sm",
    medium: "text-base",
    large:  "text-lg",
  };

  const matchesToShow = loadingMatches ? profile.matchHistory : realMatches;

  return (
    <main className={`space-y-6 ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader profile={profile} />

        <ProfileStats stats={profile.stats} />

        {profile.settings.showMatchHistory && (
          <MatchHistoryList matches={matchesToShow} />
        )}

        <EditProfile
          profile={profile}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
        />

        <SettingsPanel
          settings={profile.settings}
          onChange={(updatedSettings) =>
            setProfile({ ...profile, settings: updatedSettings })
          }
        />

        <FontSizeSelector
          fontSize={profile.settings.fontSize}
          onChange={(newFontSize) =>
            setProfile({
              ...profile,
              settings: { ...profile.settings, fontSize: newFontSize },
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
