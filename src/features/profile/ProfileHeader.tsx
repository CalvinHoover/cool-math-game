"use client";

import { useProfile } from "./useProfile";

export default function ProfileHeader() {
  const { profile, loading, error, saveProfile } = useProfile();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>{profile?.username}</h1>

      <button
        onClick={() =>
          saveProfile({
            username: "TotallyNotMax",
          })
        }
      >
        Change Username
      </button>
    </div>
  );
}