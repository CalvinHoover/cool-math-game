// initial UI for public profiles!! reference for future profile UIs :D
// test is in app/profile/page.tsx
import type { PublicProfile } from "../types";
import FriendRequestButton from "@/features/friends/FriendRequestButton";

interface ProfileHeaderProps {
    profile: PublicProfile;
    isOwnProfile: boolean;
}

// export default function ProfileHeader({ profile }: ProfileHeaderProps) {
//     return (
//         <section className="border dark:border-gray-600 p-5 shadow-sm">
//             <div className="flex items-center gap-4">
//                 <img
//                     src={profile.avatarUrl || "/default_avatar.png"}
//                     alt={`${profile.username}'s avatar`}
//                     className="h-30 w-30 rounded-full object-cover"
//                 />
//                 <div>
//                     <h1 className="text-2xl font-bold">{profile.username}</h1>
//                     {profile.bio ? (
//                         <p className="mt-2 text-gray-700 dark:text-gray-300">
//                             {profile.bio}
//                         </p>
//                     ) : (
//                         <p className="mt-2 text-gray-700 dark:text-gray-300">
//                             User has no bio.
//                         </p>
//                     )}
//                 </div>
//             </div>
//             <div className="mt-4 flex gap-4 text-sm">
//                 <p>
//                     <span className="font-bold">Level:</span> {profile.level}
//                 </p>
//             </div>
//         </section>
//     );
// }


export default function ProfileHeader({
  profile,
  isOwnProfile,
}: ProfileHeaderProps) {
  let profileAction;

  if (isOwnProfile) {
    profileAction = (
      <button className="profile-button">
        Edit Profile
      </button>
    );
  } else {
    profileAction = (
      <FriendRequestButton
        status={{
          isFriend: false,
          incomingRequest: false,
          outgoingRequest: false,
        }}
      />
    );
  }
  
  console.log("Profile passed into ProfileHeader:", profile);
  console.log("profile.bio:", profile.bio);

  return (
    <div className="profile-card">
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt={`${profile.username}'s avatar`}
          className="profile-avatar"
        />
    )}
    
    <h2>@{profile.username}</h2>

    <div className="profile-bio">
        <span className="profile-label">Bio: </span>
        <span className="profile-value">
            {profile.bio ?? "No bio yet."}
        </span>
        </div>

      {profileAction}
    </div>
  );
}