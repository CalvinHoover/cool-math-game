// temporary place to render useProfile.ts test case
// in npm run dev, go to localhost:3000/profile
// a "loading" message followed by a TestUser and "change username" button should appear
// then the username should switch to TotallyNotMax after pressing the button
// note that this change only happens once, so to see it in action again, rerun npm run dev
// import ProfileHeader from "@/features/profile/ProfileHeader";

// export default function Page() {
//   return (
//     <main>
//       <ProfileHeader />
//     </main>
//   );
// }

// test for features/profile/components/ProfileHeader.tsx and ThemeToggleWrapper.tsx
// test by visiting localhost:3000/profile

'use client';

import { useEffect, useState } from 'react';

import ProfileHeader from '@/features/profile/components/ProfileHeader';
import { testUserProfiles } from '@/features/profile/testData';
import './Profile.css';
import ProfileStats from '@/features/profile/components/ProfileStats';
import MatchHistoryList from '@/features/profile/components/MatchHistory';
import EditProfile from '@/features/profile/components/EditProfile';
import SettingsPanel from '@/features/profile/components/SettingsPanel';
import FontSizeSelector from '@/features/profile/components/FontSizeSelector';
import TopicProgress from '@/features/profile/components/TopicProgress';
import { getProfileData } from '@/features/profile/actions';
import type { ProfileData } from '@/features/profile/actions';
import { AchievementGrid } from '@/features/achievements/components/AchievementGallery';

export default function ProfilePage() {
  const [profile, setProfile] = useState(testUserProfiles[0]);
  const [realData, setRealData] = useState<ProfileData | null>(null);

  useEffect(() => {
    getProfileData().then((result) => {
      if (result.ok) {
        setRealData(result.data);
      }
    });
  }, []);

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-inner">
        <h1 className="profile-title">Player Profile</h1>
        <ProfileHeader profile={profile} />

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
          <MatchHistoryList matches={profile.matchHistory} />
        )}

        <EditProfile
          profile={profile}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
        />

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