'use client';

import { useState } from 'react';

import ProfileHeader from '@/features/profile/components/ProfileHeader';
import { testUserProfiles } from '@/features/profile/testData';
import './Profile.css';
import ProfileStats from '@/features/profile/components/ProfileStats';
import MatchHistoryList from '@/features/profile/components/MatchHistory';
import SettingsPanel from '@/features/profile/components/SettingsPanel';
import FontSizeSelector from '@/features/profile/components/FontSizeSelector';
import TopicProgress from '@/features/profile/components/TopicProgress';
import type { ProfileData } from '@/features/profile/actions';
import { AchievementGrid } from '@/features/achievements/components/AchievementGallery';

interface ProfileContentProps {
  realData: ProfileData | null;
}

export default function ProfileContent({ realData }: ProfileContentProps) {
  const [profile, setProfile] = useState(testUserProfiles[0]);

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-inner">
        <h1 className="profile-title">Player Profile</h1>
        <ProfileHeader profile={realData ? { ...profile, username: realData.username } : profile} />

        {realData ? (
          <ProfileStats
            totalXp={realData.totalXp}
            globalLevel={realData.globalLevel}
            currentLevelXp={realData.currentLevelXp}
            nextLevelXp={realData.nextLevelXp}
            practiceSessionsCompleted={realData.practiceSessionsCompleted}
          />
        ) : (
          <ProfileStats
            totalXp={profile.stats.xp}
            globalLevel={profile.stats.level}
            currentLevelXp={0}
            nextLevelXp={100}
            practiceSessionsCompleted={profile.stats.gamesCompleted}
          />
        )}

        {realData && <TopicProgress topics={realData.topics} />}

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

        <section className="profile-section">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          {realData ? (
            <AchievementGrid achievements={realData.achievements} />
          ) : (
            <p className="text-gray-600 dark:text-gray-300">Loading achievements...</p>
          )}
        </section>

        <section className="profile-section">
          <h2 className="text-xl font-bold">Friends</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            INSERT FRIEND LIST HERE
          </p>
        </section>
      </div>
    </main>
  );
}
