'use client';

import { useEffect, useState } from 'react';
import { getFriends, getFriendRequests, acceptFriendRequest, denyFriendRequest } from './api';
import type { Friend, FriendRequest } from './types';

export default function FriendsList({ showTitle = true }: { showTitle?: boolean }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    getFriends().then(setFriends);
    getFriendRequests().then(setRequests);
  }, []);

  async function handleAccept(requestId: string) {
    try {
      const newFriend = await acceptFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setFriends((prev) => [...prev, newFriend]);
    } catch {
      alert('Could not accept request.');
    }
  }

  async function handleDeny(requestId: string) {
    try {
      await denyFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch {
      alert('Could not deny request.');
    }
  }

  return (
    <div>
{showTitle && <h2>Incoming Requests</h2>}
      {requests.length === 0 ? (
        <p style={{ color: '#888888', fontFamily: 'Courier New', fontSize: '0.9rem' }}>
          No pending requests.
        </p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="friends-card">
            <div className="friends-avatar-frame">
              <div className="friends-avatar-placeholder">?</div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#00ffff', fontFamily: 'Courier New', margin: '0 0 4px' }}>
                @{req.fromUser.username}
              </h3>
              <p style={{ fontFamily: 'Courier New', color: '#aaaaaa', margin: '0 0 8px' }}>
                Level {req.fromUser.level}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="friends-button"
                  onClick={() => handleAccept(req.id)}
                  style={{ margin: 0, background: '#00aa00', padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  Accept
                </button>
                <button
                  className="friends-button"
                  onClick={() => handleDeny(req.id)}
                  style={{ margin: 0, background: '#cc0000', padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  Deny
                </button>
              </div>
            </div>
          </div>
        ))
      )}

{showTitle && <h2 style={{ marginTop: '28px' }}>Your Friends</h2>}
      {friends.length === 0 ? (
        <p style={{ color: '#888888', fontFamily: 'Courier New', fontSize: '0.9rem' }}>
          No friends yet — search for players above to add them!
        </p>
      ) : (
        friends.map((f) => (
          <div key={f.profile.id} className="friends-card">
            <div className="friends-avatar-frame">
              {f.profile.avatarUrl ? (
                <img src={f.profile.avatarUrl} alt={f.profile.username} className="friends-avatar" />
              ) : (
                <div className="friends-avatar-placeholder">?</div>
              )}
            </div>
            <div>
              <h3 style={{ color: '#00ffff', fontFamily: 'Courier New', margin: '0 0 4px' }}>
                @{f.profile.username}
              </h3>
              <p style={{ fontFamily: 'Courier New', color: '#aaaaaa', margin: 0 }}>
                Level {f.profile.level}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
