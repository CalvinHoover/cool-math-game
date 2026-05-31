"use client";

import { useProfile } from "./useProfile";
import type { UserProfile } from "./types";

type ProfileHeaderProps = {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {profile.username}
      </h1>

      {profile.bio && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {profile.bio}
        </p>
      )}

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Level {profile.level}
      </p>
    </section>
  );
  
  // const { profile, loading, error, saveProfile } = useProfile();

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  // if (error) {
  //   return <p>{error}</p>;
  // }

  // return (
  //   <div>
  //     <h1>{profile?.username}</h1>

  //     <button
  //       onClick={() =>
  //         saveProfile({
  //           username: "TotallyNotMax",
  //         })
  //       }
  //     >
  //       Change Username
  //     </button>
  //   </div>
  // );
}