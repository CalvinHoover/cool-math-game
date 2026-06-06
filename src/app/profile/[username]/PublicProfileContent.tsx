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
        <ProfileHeader profile={localProfile} isOwnProfile={false} />

        <ProfileStats stats={localProfile.stats} />

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

      </div>
    </main>
  );
}
