import type { PublicProfile } from "../profile/types";

// will be used for Add Friend / Remove Friend button later
// simply shows the status -- NOT the request itself
export interface FriendStatus {
    isFriend: boolean;
    incomingRequest: boolean;
    outgoingRequest: boolean;
}

// the only information the user will be able to see from their friend
export interface Friend {
    profile: PublicProfile;
    status: FriendStatus;
}

// for friend request status itself
export interface FriendRequest {
    id: string;
    fromUser: PublicProfile;
    toUser: PublicProfile;
    status: "pending" | "accepted" | "denied";
    createdAt: string;
}