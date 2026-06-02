// for displaying individual friends on the UI

"use client";

import type { Friend } from "./types";
import FriendRequestButton from "./FriendRequestButton";

interface FriendCardProps {
    friend: Friend;
}

export default function FriendCard ({
    friend,
}: FriendCardProps) {
    return (
        <div>
            <h3>{friend.profile.username}</h3>
            <p>@{friend.profile.id}</p>
            <FriendRequestButton
                status={friend.status}
            />
        </div>
    );
}