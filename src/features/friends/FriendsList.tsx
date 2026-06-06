"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getFriends, getFriendRequests, acceptFriendRequest, denyFriendRequest } from "./api";
import type { Friend, FriendRequest } from "./types";
import FriendCard from "./FriendCard";

type FriendsListProps = {
    showTitle?: boolean;
};

export default function FriendsList({ showTitle = true }: FriendsListProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        async function load() {
            const [friendsData, requestsData] = await Promise.all([
                getFriends(),
                getFriendRequests(),
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
        }
        load();
    }, []);

    async function handleAccept(id: string) {
        await acceptFriendRequest(id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
    }

    async function handleDeny(id: string) {
        await denyFriendRequest(id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div>
            {showTitle && <h1 style={{ color: '#FFFF00', fontFamily: 'Courier New', textTransform: 'uppercase' }}>Friends</h1>}

            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: '#00ffff', fontFamily: 'Courier New', fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Incoming Requests
                </h2>
                {requests.length === 0 ? (
                    <p style={{ fontFamily: 'Courier New', color: '#888888' }}>No pending requests.</p>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '12px', border: '4px inset #cccccc', background: '#000000' }}
                        >
                            <Link
                                href={`/profile/${req.fromUser.username}`}
                                style={{ color: '#FFFF00', fontFamily: 'Courier New', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                                @{req.fromUser.username}
                            </Link>
                            <button className="friends-button" onClick={() => handleAccept(req.id)}>Accept</button>
                            <button className="friends-button" onClick={() => handleDeny(req.id)}>Deny</button>
                        </div>
                    ))
                )}
            </div>

            <div>
                <h2 style={{ color: '#00ffff', fontFamily: 'Courier New', fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Your Friends
                </h2>
                {friends.length === 0 ? (
                    <p style={{ fontFamily: 'Courier New' }}>No friends yet. Search for players to add them!</p>
                ) : (
                    friends.map((friend) => (
                        <div key={friend.profile.username} style={{ marginBottom: '4px' }}>
                            <FriendCard friend={friend} />
                            <div style={{ marginBottom: '8px' }}>
                                <Link
                                    href={`/profile/${friend.profile.username}`}
                                    className="friends-button"
                                    style={{ display: 'inline-block', textDecoration: 'none' }}
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
