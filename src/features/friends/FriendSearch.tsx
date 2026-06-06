"use client";

import { useState } from "react";
import { searchUsers, sendFriendRequest } from "./api";
import type { PublicProfile } from "../profile/types";

export default function FriendSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PublicProfile[]>([]);
    const [searched, setSearched] = useState(false);
    const [sentTo, setSentTo] = useState<Set<string>>(new Set());

    async function handleSearch() {
        const data = await searchUsers(query);
        setResults(data);
        setSearched(true);
    }

    async function handleAdd(username: string) {
        await sendFriendRequest(username);
        setSentTo((prev) => new Set(prev).add(username));
    }

    return (
        <div>
          <h2>Find Friends</h2>

          <input
            className="friends-input"
            type="text"
            placeholder="Search by username"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button className="friends-button" onClick={handleSearch}>
            Search
          </button>

          {searched && results.length === 0 && (
            <p>No players found.</p>
          )}

          <div className="friends-search-results">
            {results.map((user) => (
              <div
              key={user.username}
              className="friends-search-card"
            >
              <div className="friends-avatar-frame">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.username}'s avatar`}
                    className="friends-avatar"
                  />
                ) : (
                  <div className="friends-avatar-placeholder">
                    ?
                  </div>
                )}
              </div>

              <div>
                <h3>@{user.username}</h3>
                <p>Level {user.level}</p>

                {user.bio && (
                  <p>{user.bio}</p>
                )}
              </div>

              <button
                className="friends-button"
                disabled={sentTo.has(user.username)}
                onClick={() => handleAdd(user.username)}
              >
                {sentTo.has(user.username) ? 'Sent!' : 'Add Friend'}
              </button>
            </div>
            ))}
          </div>
        </div>
      );
}
