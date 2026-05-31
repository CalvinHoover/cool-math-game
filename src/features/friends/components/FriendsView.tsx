'use client';

import { useFriendNotifications } from '../useFriendNotifications';
import AddFriendSearch from './AddFriendSearch';
import IncomingRequests from './IncomingRequests';
import FriendsList from './FriendsList';

export default function FriendsView({ myId }: { myId: string }) {
  const { friends, requests, loading, acceptRequest, denyRequest, removeFriend } =
    useFriendNotifications(myId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Friends</h1>
      <AddFriendSearch />
      <IncomingRequests requests={requests} onAccept={acceptRequest} onDeny={denyRequest} />
      {loading ? (
        <p className="text-sm text-gray-500">Loading friends…</p>
      ) : (
        <FriendsList friends={friends} onRemove={removeFriend} />
      )}
    </div>
  );
}
