'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ProfileHeader from '@/features/profile/components/ProfileHeader';
import { testUserProfiles } from '@/features/profile/testData';
import './Profile.css';
import ProfileStats from '@/features/profile/components/ProfileStats';
import MatchHistoryList from '@/features/profile/components/MatchHistory';
import SettingsPanel from '@/features/profile/components/SettingsPanel';
import FontSizeSelector from '@/features/profile/components/FontSizeSelector';
import EditProfile from '@/features/profile/components/EditProfile';
import FriendsList from '@/features/friends/FriendsList';
import type { ProfileData } from '@/features/profile/actions';
import type { ProfileStats as ProfileStatsType } from '@/features/profile/types';
import '@/app/friends/Friends.css';

interface ProfileContentProps {
  realData: ProfileData | null;
}

export default function ProfileContent({ realData }: ProfileContentProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(testUserProfiles[0]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const displayProfile = {
    id: profile.id,
    username: realData?.username ?? profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
  };

  const stats: ProfileStatsType = realData
    ? {
        level: realData.globalLevel,
        xp: realData.totalXp,
        gamesCompleted: realData.practiceSessionsCompleted,
        recentWins: [],
      }
    : profile.stats;

  const completedLevels = realData?.globalLevel ?? profile.level;

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-topbar">
        <button
          className="profile-button"
          onClick={() => router.push('/dashboard')}
          style={{ marginBottom: '8px' }}
        >
          ← Back to Menu
        </button>
        <h1 className="profile-title">PROFILE</h1>
      </div>

      <div className="profile-layout">
        <div className="profile-left-column">
          <ProfileHeader
            profile={displayProfile}
            isOwnProfile={true}
            onEditProfile={() => setIsEditingProfile(true)}
          />

          {isEditingProfile && (
            <>
              <EditProfile
                profile={{
                  ...profile,
                  username: realData?.username ?? profile.username,
                  email: realData?.email ?? profile.email,
                }}
                onSave={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setIsEditingProfile(false);
                }}
                onCancel={() => setIsEditingProfile(false)}
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
              <div className="profile-edit-controls">
                <button
                  className="profile-button profile-danger-button"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel Edit
                </button>
              </div>
            </>
          )}

          <section className="profile-section">
            <h2>Friends</h2>
            <FriendsList showTitle={false} />
            <div className="profile-button-row">
              <button
                className="profile-button"
                onClick={() => router.push('/friends')}
              >
                View Friends Page
              </button>
            </div>
          </section>
        </div>

        <div className="profile-right-column">
          <div className="profile-level-box">
            {displayProfile.username} has completed {completedLevels} levels!
          </div>

          <ProfileStats stats={stats} />

          {profile.settings.showMatchHistory && (
            <MatchHistoryList matches={profile.matchHistory} />
          )}
        </div>
      </div>
    </main>
  );
}
