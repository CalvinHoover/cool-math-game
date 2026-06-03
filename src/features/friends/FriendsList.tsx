"use client";

import { useEffect, useState } from "react";

import {getFriends} from "./api";
import type { Friend } from "./types";
import FriendCard from "./FriendCard";

export default function FriendsList() {
    const [friends, setFriends] = useState<Friend[]>([]);
    useEffect(() => {
        async function loadFriends() {
            const data = await getFriends();
            setFriends(data);
        }
        loadFriends();
    }, []);

    return (
        <div>
            <h1> Friends </h1>
            {friends.map((friend) => (
                <FriendCard
                    key={friend.profile.username}
                    friend={friend}
                />
            ))}
        </div>
    );
}