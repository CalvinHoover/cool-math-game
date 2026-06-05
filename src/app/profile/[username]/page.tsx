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
import FriendsList from "@/features/friends/FriendsList";
import BackButton from '@/components/interface/BackButton';
import { testUserProfiles } from "@/features/profile/testData";
import type { PastMatch } from "@/features/profile/types";
import "@/app/friends/Friends.css";
import "../Profile.css";

export default function ProfileUsernamePage() {
  const params   = useParams<{ username: string }>();
  const username = params.username;
  const router   = useRouter();

  const foundProfile = testUserProfiles.find((u) => u.username === username);

  const [profile,         setProfile]         = useState(foundProfile);
  const [realMatches,     setRealMatches]     = useState<PastMatch[]>([]);
  const [loadingMatches,  setLoadingMatches]  = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isEditing,       setIsEditing]       = useState(false);

  const isOwnProfile = currentUsername === username;

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setCurrentUsername(data.username))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/profile/${username}/matches`)
      .then(res => res.json())
      .then((data: PastMatch[]) => { if (Array.isArray(data)) setRealMatches(data); })
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

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <BackButton />
        </div>
      </main>
    );
  }

  const fontSizeClasses = { small: "text-sm", medium: "text-base", large: "text-lg" };
  const matchesToShow   = loadingMatches ? profile.matchHistory : realMatches;

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-topbar">
        <h1 className="profile-title">PROFILE</h1>
      </div>

      <div className="profile-layout">
        <div className="profile-left-column">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => setIsEditing(true)}
          />

          {isEditing && isOwnProfile && (
            <EditProfile
              profile={profile}
              onSave={(updated) => { setProfile(updated); setIsEditing(false); }}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {!isOwnProfile && currentUsername && (
            <FriendRequestButton
              username={username}
              status={{ isFriend: false, incomingRequest: false, outgoingRequest: false }}
            />
          )}

          {/*
          <section className="profile-section">
            <h2>Achievements</h2>
            <p>INSERT ACHIEVEMENTS HERE</p>
          </section>
          */}

          <section className="profile-section">
            <h2>Friends</h2>
            <FriendsList />
            <div className="profile-button-row">
              <button className="profile-button" onClick={() => router.push('/friends')}>
                View Friends Page
              </button>
            </div>
          </section>
        </div>

        <div className="profile-right-column">
          <div className="profile-level-box">
            {profile.username} has completed {profile.level} levels!
          </div>
          <ProfileStats stats={profile.stats} />
          {profile.settings.showMatchHistory && (
            <MatchHistoryList matches={matchesToShow} />
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <BackButton />
          </div>
        </div>
      </div>
    </main>
  );
}
