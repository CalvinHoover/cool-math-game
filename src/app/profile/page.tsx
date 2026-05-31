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

import ProfileHeader from "@/features/profile/components/ProfileHeader";
import { testPublicProfiles, testUserProfiles } from "@/features/profile/testData";
import ThemeToggleWrapper from "@/features/profile/components/ThemeToggleWrapper";
import "./Profile.css"
import ProfileStats from "@/features/profile/components/ProfileStats";
import RecentWinCard from "@/features/profile/components/ProfileStats";
import MatchHistoryList from "@/features/profile/components/MatchHistory";
import { M_PLUS_1 } from "next/font/google";
import EditProfile from "@/features/profile/components/EditProfile";

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
  const [profile, setProfile] = useState(testUserProfiles[0]); // using goober1 for now

  return (
    <ThemeToggleWrapper>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader profile={profile} />

        <ProfileStats stats={testStats} />
        
        <MatchHistoryList matches={testMatchHistory} />

        <EditProfile 
          profile={profile}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
        />
        {/* <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Recently Played</h2>
          <div className="mt-4 space-y-3">
            {testStats.recentWins.map((win) => (
              <div
                key={win.gameId}
                className="rounded-md border p-4 dark:border-gray-700"
              >
                <p className="font-semibold">{win.topic}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Level {win.gameLevel}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {win.description}
                </p>
              </div>
            ))}
          </div>
        </section> */}

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
    </ThemeToggleWrapper>
  );
}