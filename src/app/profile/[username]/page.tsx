"use client";

import { use, useState } from "react";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileStats from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import { testUserProfiles } from "@/features/profile/testData";

import "../Profile.css";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = use(params);

  console.log("URL username:", username);
  console.log(
    "Available usernames:",
    testUserProfiles.map((profile) => profile.username)
  );

  const foundProfile = testUserProfiles.find(
    (profile) => profile.username === username
  );

  const [profile] = useState(foundProfile);

  if (!profile) {
    return (
      <main className="profile-container">
        <div className="profile-inner">
          <h1 className="profile-title">Profile Not Found</h1>

          <section className="profile-section">
            <p>No user exists with the username @{username}.</p>
          </section>
        </div>
      </main>
    );
  }

  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-inner">
        <h1 className="profile-title">Player Profile</h1>

        <ProfileHeader
          profile={profile}
          isOwnProfile={false}
        />

        <ProfileStats stats={profile.stats} />

        {profile.settings.showMatchHistory && (
          <MatchHistoryList matches={profile.matchHistory} />
        )}

        <section className="profile-section">
          <h2>Achievements</h2>
          <p>INSERT ACHIEVEMENTS HERE</p>
        </section>

        <section className="profile-section">
          <h2>Friends</h2>
          <p>INSERT FRIEND LIST HERE</p>
        </section>
      </div>
    </main>
  );
}