import { getSession } from '@/features/auth/session';
import { Navbar } from '@/components/layout/Navbar';
import { testUserProfiles } from '@/features/profile/testData';
import PublicProfileContent from './PublicProfileContent';

interface ProfileUsernamePageProps {
  params: { username: string };
}

export default async function ProfileUsernamePage({ params }: ProfileUsernamePageProps) {
  const session = await getSession();
  const foundProfile = testUserProfiles.find(
    (user) => user.username === params.username
  );

  if (!foundProfile) {
    return (
      <>
        <Navbar username={session?.username ?? 'Guest'} />
        <main className="p-6 text-white">
          <p>User not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar username={session?.username ?? 'Guest'} />
      <PublicProfileContent profile={foundProfile} />
    </>
  );
}