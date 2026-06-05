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

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import { testPublicProfiles, testUserProfiles } from "@/features/profile/testData";
import ThemeToggleWrapper from "@/features/profile/components/ThemeToggleWrapper";
import "./Profile.css"
import ProfileStats from "@/features/profile/components/ProfileStats";
import RecentWinCard from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import { M_PLUS_1 } from "next/font/google";
import EditProfile from "@/features/profile/components/EditProfile";
import SettingsPanel from "@/features/profile/components/SettingsPanel"
import FontSizeSelector from "@/features/profile/components/FontSizeSelector";
import FriendsList from "@/features/friends/FriendsList";
import "@/app/friends/Friends.css";

const testStats = {
  level: 5,
  xp: 1000,
  gamesCompleted: 20,
  recentWins: [
    {
      gameId: 1,
      gameLevel: 1,
      topic: "Algebra 1",
      description: "This is a pretend game about Algebra.",
      button: null,
    },
    {
      gameId: 2,
      gameLevel: 2,
      topic: "Algebra 1",
      description: "This is also a pretend game about Algebra.",
      button: null,
    }
  ]
}

const testMatchHistory = [
  {
    id: 1,
    topic: "Algebra",
    level: 3,
    opponent: "evilgoober1",
    result: "Won" as const,
    completedOn: "May 1, 2026,"
  },
  {
    id: 2,
    topic: "Algebra",
    level: 4,
    opponent: "evilgoober2",
    result: "Won" as const,
    completedOn: "May 2, 2026,"
  }
]


export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(testUserProfiles[0]); // using goober1 for now
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <main className={`profile-container ${fontSizeClasses[profile.settings.fontSize]}`}>
      <div className="profile-topbar">
        <h1 className="profile-title">PROFILE</h1>
      </div>
  
      <div className="profile-layout">
        <div className="profile-left-column">
          <ProfileHeader
            profile={profile}
            isOwnProfile={true}
            onEditProfile={() => setIsEditingProfile(true)}
          />

          {isEditingProfile && (
              <>
                <EditProfile
                  profile={profile}
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
  
          {/*
          <section className="profile-section">
            <h2>Achievements</h2>
            <p>INSERT ACHIEVEMENTS HERE</p>
          </section>
          */}
  
          <section className="profile-section">
            <h2>Friends</h2>
            <FriendsList showTitle={false} />
            <div className="profile-button-row">
              <button
                className="profile-button"
                onClick={() => router.push("/friends")}
              >
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
            <MatchHistoryList matches={profile.matchHistory} />
          )}
  
          {/* {isEditingProfile && (
              <>
                <EditProfile
                  profile={profile}
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

                <button
                  className="profile-button profile-danger-button"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Close Edit Mode
                </button>
              </>
            )} */}
          
        </div>
      </div>
    </main>
  );
}