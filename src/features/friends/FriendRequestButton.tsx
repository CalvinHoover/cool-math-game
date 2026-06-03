// toggle button for friend requesting!
"use client";

import { useState } from "react";
import { FriendStatus } from "./types";

interface FriendRequestButtonProps {
    status: FriendStatus;
}

export default function FriendRequestButton({status,}: FriendRequestButtonProps) {
    if (status.isFriend) {
        return <button className="friends-button">Friends</button>;
    }
    if (status.incomingRequest) {
        return (
            <div>
                <button className="friends-button">Accept</button>
                <button className="friends-button">Reject</button>
            </div>
        );
    }
    if (status.outgoingRequest) {
        return <button className="friends-button">Request Sent!</button>;
    }
    return <button className="friends-button profile-button">Add Friend</button>;
}