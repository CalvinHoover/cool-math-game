// temporary place to render useProfile.ts test case
// in npm run dev, go to localhost:3000/profile
// a "loading" message followed by a TestUser and "change username" button should appear
// then the username should switch to TotallyNotMax after pressing the button
// note that this change only happens once, so to see it in action again, rerun npm run dev
import ProfileHeader from "@/features/profile/ProfileHeader";

export default function Page() {
  return (
    <main>
      <ProfileHeader />
    </main>
  );
}