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
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import { testPublicProfiles } from "@/features/profile/testData";
import ThemeToggleWrapper from "@/features/profile/components/ThemeToggleWrapper";
import "./Profile.css"

export default function ProfilePage() {
  const profile = testPublicProfiles[0]; // using goober1 for now

  return (
    <ThemeToggleWrapper>
      <div className="mx-auto max-w-4xl space-y-6">
        <ProfileHeader profile={profile} />

        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Recently Played</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            INSERT RECENT GAMES HERE
          </p>
        </section>

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