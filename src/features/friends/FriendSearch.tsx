'use client';

import { useState } from 'react';
import { searchUsers, sendFriendRequest } from './api';
import type { PublicProfile } from '../profile/types';

export default function FriendSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchUsers(query);
    setResults(data);
    setSearched(true);
    setLoading(false);
  }

  async function handleAddFriend(username: string) {
    try {
      await sendFriendRequest(username);
    } catch {
    }
    setSentTo((prev) => new Set(prev).add(username));
  }

  return (
    <div>
      <h2>Find Friends</h2>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          className="friends-input"
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <button
          className="friends-button"
          onClick={handleSearch}
          disabled={loading}
          style={{ margin: 0, flexShrink: 0 }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      <div className="friends-search-results">
        {searched && results.length === 0 && (
          <p style={{ color: '#888888', fontFamily: 'Courier New', marginTop: '12px' }}>
            No players found for &quot;{query}&quot;.
          </p>
        )}

        {results.map((user) => (
          <div key={user.id} className="friends-search-card">
            <div className="friends-avatar-frame">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="friends-avatar" />
              ) : (
                <div className="friends-avatar-placeholder">?</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h3>@{user.username}</h3>
              <p style={{ color: '#aaaaaa', margin: '2px 0' }}>Level {user.level}</p>
            </div>

            {sentTo.has(user.username) ? (
              <button
                className="friends-button"
                disabled
                style={{ margin: 0, background: '#444444', cursor: 'default' }}
              >
                Sent!
              </button>
            ) : (
              <button
                className="friends-button"
                onClick={() => handleAddFriend(user.username)}
                style={{ margin: 0, background: '#00aa00' }}
              >
                Add Friend
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
