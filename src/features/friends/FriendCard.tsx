// for displaying individual friends on the UI

"use client";

import type { Friend } from "./types";
import FriendRequestButton from "./FriendRequestButton";

interface FriendCardProps {
    friend: Friend;
}

export default function FriendCard({ friend }: FriendCardProps) {
    return (
      <div className="friends-card">
        {friend.profile.avatarUrl ? (
          <img
            src={friend.profile.avatarUrl}
            alt={`${friend.profile.username}'s avatar`}
            className="friends-avatar"
          />
        ) : (
          <div className="friends-avatar-placeholder">?</div>
        )}
  
        <div>
          <h3>@{friend.profile.username}</h3>
          <p>Level {friend.profile.level}</p>
  
          {friend.profile.bio && <p>{friend.profile.bio}</p>}
  
          <FriendRequestButton status={friend.status} />
        </div>
      </div>
    );
}