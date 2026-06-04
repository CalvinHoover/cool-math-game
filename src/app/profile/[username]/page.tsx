"use client";

import { use, useState, useEffect } from "react";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import { testUserProfiles } from "@/features/profile/testData";
import type { PastMatch } from "@/features/profile/types";
import BackButton from '@/components/interface/BackButton';
import "../Profile.css";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = use(params);

  const foundProfile = testUserProfiles.find((p) => p.username === username);
  const [profile] = useState(foundProfile);
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
      <main className="profile-container">
        <div className="profile-inner">
          <h1 className="profile-title">Profile Not Found</h1>
          <section className="profile-section">
            <p>No user exists with the username @{username}.</p>
          </section>
          <h1 className="text-2xl font-bold">{username}</h1>
          {loadingMatches
            ? <p>Loading match history...</p>
            : realMatches.length === 0
              ? <p>No matches played yet.</p>
              : <MatchHistoryList matches={realMatches} />}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  const fontSizeClasses = { small: "text-sm", medium: "text-base", large: "text-lg" };
  const matchesToShow = loadingMatches ? profile.matchHistory : realMatches;

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-topbar">
        <h1 className="profile-title">PROFILE</h1>
      </div>
      <div className="profile-layout">
        <div className="profile-left-column">
          <ProfileHeader profile={profile} isOwnProfile={false} />
          <section className="profile-section">
            <h2>Achievements</h2>
            <p>INSERT ACHIEVEMENTS HERE</p>
          </section>
          <section className="profile-section">
            <h2>Friends</h2>
            <p>INSERT FRIEND LIST HERE</p>
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
