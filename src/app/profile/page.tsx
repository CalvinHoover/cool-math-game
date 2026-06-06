import { getProfileData } from '@/features/profile/actions';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
  const realDataResult = await getProfileData();
  const realData = realDataResult.ok ? realDataResult.data : null;

  return <ProfileContent realData={realData} />;
}