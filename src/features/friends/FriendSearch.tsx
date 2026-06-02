"use client";

import { useState } from "react";
import { searchUsers } from "./api";
import type { PublicProfile } from "../profile/types";

export default function FriendSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PublicProfile[]>([]);

    async function handleSearch() {
        const data = await searchUsers(query);
        setResults(data);
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
    
          <div className="friends-search-results">
            {results.map((user) => (
              <div
              key={user.username}
              className="friends-search-card"
            >
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
            
              <div>
                <h3>@{user.username}</h3>
                <p>Level {user.level}</p>
            
                {user.bio && (
                  <p>{user.bio}</p>
                )}
              </div>
            </div>
            ))}
          </div>
        </div>
      );
}