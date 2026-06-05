// initial UI for public profiles!! reference for future profile UIs :D
// test is in app/profile/page.tsx
import type { PublicProfile } from "../types";

interface ProfileHeaderProps {
    profile: PublicProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <section className="border dark:border-gray-600 p-5 shadow-sm">
            <div className="flex items-center gap-4">
                <img
                    src={profile.avatarUrl || "/default_avatar.png"}
                    alt={`${profile.username}'s avatar`}
                    className="h-30 w-30 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                </div>
            </div>
        </section>
    );
}