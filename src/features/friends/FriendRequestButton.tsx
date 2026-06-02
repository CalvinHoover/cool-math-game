// toggle button for friend requesting!
"use client";

import { useState } from "react";
import { FriendStatus } from "./types";

interface FriendRequestButtonProps {
    status: FriendStatus;
}

export default function FriendRequestButton({status,}: FriendRequestButtonProps) {
    if (status.isFriend) {
        return <button>Friends</button>;
    }
    if (status.incomingRequest) {
        return (
            <div>
                <button>Accept</button>
                <button>Reject</button>
            </div>
        );
    }
    if (status.outgoingRequest) {
        return <button>Request Sent!</button>;
    }
    return <button>Add Friend</button>;
}