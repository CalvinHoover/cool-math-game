import { getSession } from '@/features/auth/session';
import { getProfileData } from '@/features/profile/actions';
import { Navbar } from '@/components/layout/Navbar';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
  const session = await getSession();
  const realDataResult = await getProfileData();
  const realData = realDataResult.ok ? realDataResult.data : null;

  return (
    <>
      <Navbar username={session?.username ?? 'Guest'} />
      <ProfileContent realData={realData} />
    </>
  );
}