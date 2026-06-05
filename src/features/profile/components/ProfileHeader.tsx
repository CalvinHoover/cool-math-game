import FriendRequestButton from "@/features/friends/FriendRequestButton";

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
  };
  isOwnProfile: boolean;
  onEditProfile?: () => void
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  onEditProfile
}: ProfileHeaderProps) {
  let profileAction;

  if (isOwnProfile) {
    profileAction = (
      <button 
        className="profile-button"
        onClick={onEditProfile}
      >
        Edit Profile
      </button>
    );
  } else {
    profileAction = (
        <FriendRequestButton
            username={profile.username}
            status={{
                isFriend: false,
                incomingRequest: false,
                outgoingRequest: false,
            }}
        />
    );
  }

  return (
    <section className="profile-section">
      <div className="profile-header-content">
        <div className="profile-avatar-frame">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="profile-avatar-large"
            />
          ) : (
            <div className="profile-avatar-placeholder-large">?</div>
          )}
        </div>

        <h2 className="profile-username">@{profile.username}</h2>

        <div className="profile-bio">
          <span className="profile-label">Bio: </span>
          <span className="profile-value">
            {profile.bio || "No bio yet."}
          </span>
        </div>

        {profileAction}
      </div>
    </section>
  );
}