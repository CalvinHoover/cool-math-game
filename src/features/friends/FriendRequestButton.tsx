// toggle button for friend requesting!
"use client";

import { useState } from "react";
import { FriendStatus } from "./types";
import { sendFriendRequest } from "./api";

interface FriendRequestButtonProps {
  status:   FriendStatus;
  username: string;
}

export default function FriendRequestButton({ status, username }: FriendRequestButtonProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  async function handleAddFriend() {
    try {
      await sendFriendRequest(username);
      setCurrentStatus({ isFriend: false, incomingRequest: false, outgoingRequest: true });
    } catch {
      alert('Could not send friend request.');
    }
  }

  if (currentStatus.isFriend)        return <button className="friends-button">Friends</button>;
  if (currentStatus.incomingRequest) return (
    <div>
      <button className="friends-button">Accept</button>
      <button className="friends-button">Reject</button>
    </div>
  );
  if (currentStatus.outgoingRequest) return <button className="friends-button">Request Sent!</button>;

  return <button className="friends-button profile-button" onClick={handleAddFriend}>Add Friend</button>;
}