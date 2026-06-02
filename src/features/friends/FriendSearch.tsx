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
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
    
          <button onClick={handleSearch}>
            Search
          </button>
    
          <div>
            {results.map((user) => (
              <div key={user.id}>
                <h3>{user.username}</h3>
                <p>@{user.id}</p>
              </div>
            ))}
          </div>
        </div>
      );
}