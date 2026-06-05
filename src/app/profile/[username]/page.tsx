"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import EditProfile from "@/features/profile/components/EditProfile";
import SettingsPanel from "@/features/profile/components/SettingsPanel";
import FontSizeSelector from "@/features/profile/components/FontSizeSelector";
import FriendRequestButton from "@/features/friends/FriendRequestButton";
import { testUserProfiles } from "@/features/profile/testData";
import type { PastMatch } from "@/features/profile/types";

export default function ProfileUsernamePage() {
  const params   = useParams<{ username: string }>();
  const username = params.username;
  const router   = useRouter();

  const foundProfile = testUserProfiles.find((u) => u.username === username);

  const [profile,          setProfile]          = useState(foundProfile);
  const [realMatches,      setRealMatches]      = useState<PastMatch[]>([]);
  const [loadingMatches,   setLoadingMatches]   = useState(true);
  const [currentUsername,  setCurrentUsername]  = useState<string | null>(null);
  const [isEditing,        setIsEditing]        = useState(false);

  const isOwnProfile = currentUsername === username;

  // Fetch logged-in user
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setCurrentUsername(data.username))
      .catch(() => {});
  }, []);

  // Fetch real match history
  useEffect(() => {
    fetch(`/api/profile/${username}/matches`)
      .then((res) => res.json())
      .then((data: PastMatch[]) => {
        if (Array.isArray(data)) setRealMatches(data);
      })
      .catch(console.error)
      .finally(() => setLoadingMatches(false));
  }, [username]);

  if (!profile) {
    return (
      <main className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">{username}</h1>

        {isOwnProfile ? (
          <>
            <button className="profile-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            {isEditing && (
              <EditProfile
                profile={{
                  id: '', username, bio: '', email: '', level: 0,
                  createdAt: '', updatedAt: '',
                  stats: { level: 0, xp: 0, gamesCompleted: 0, recentWins: [] },
                  settings: { emailNotifications: false, publicProfile: true, showMatchHistory: true, fontSize: 'medium' },
                  matchHistory: [],
                }}
                onSave={async (updated) => {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: updated.username, bio: updated.bio }),
                  });
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            )}
          </>
        ) : currentUsername && (
          <FriendRequestButton
            username={username}
            status={{ isFriend: false, incomingRequest: false, outgoingRequest: false }}
          />
        )}

        {loadingMatches
          ? <p>Loading match history...</p>
          : realMatches.length === 0
            ? <p>No matches played yet.</p>
            : <MatchHistoryList matches={realMatches} />}

        <button onClick={() => router.push('/dashboard')} className="profile-button" style={{ marginTop: '2rem' }}>
          Back to Menu
        </button>
      </main>
    );
  }

  const fontSizeClasses = { small: "text-sm", medium: "text-base", large: "text-lg" };
  const matchesToShow = loadingMatches ? profile.matchHistory : realMatches;

  return (
    <main className={`space-y-6 ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => setIsEditing(true)}
        />
        
        {isEditing && isOwnProfile && (
            <EditProfile
                profile={profile}
                onSave={(updatedProfile) => { setProfile(updatedProfile); setIsEditing(false); }}
                onCancel={() => setIsEditing(false)}
            />
        )}

        <ProfileStats stats={profile.stats} />

        {profile.settings.showMatchHistory && (
          <MatchHistoryList matches={matchesToShow} />
        )}

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
          <p className="mt-2 text-gray-600 dark:text-gray-300">INSERT ACHIEVEMENTS HERE</p>
        </section>

        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Friends</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">INSERT FRIEND LIST HERE</p>
        </section>
      </div>
    </main>
  );
}
