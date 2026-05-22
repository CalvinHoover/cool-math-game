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

export default function ProfilePage() {
  return (
    <ThemeToggleWrapper>
      <ProfileHeader profile={testPublicProfiles[0]} />
    </ThemeToggleWrapper>
  );
}