import Link from 'next/link';
import FriendSearch from '@/features/friends/FriendSearch';
import FriendsList from '@/features/friends/FriendsList';
import './Friends.css';

export default function FriendsPage() {
  return (
    <div className="friends-container">
      <div className="friends-inner">
        <h1 className="friends-title">Friends</h1>

        <section className="friends-section">
          <FriendSearch />
        </section>

        <section className="friends-section">
          <FriendsList />
        </section>

        <Link href="/dashboard">
          <button className="friends-button" style={{ background: '#666666', marginTop: '8px' }}>
            ← Back to Menu
          </button>
        </Link>
      </div>
    </div>
  );
}
