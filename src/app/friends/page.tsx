// import FriendsTester from "@/features/friends/FriendsTester";

import "./Friends.css"

import FriendsList from "@/features/friends/FriendsList";
import FriendSearch from "@/features/friends/FriendSearch";
import PastOpponents from "@/features/friends/PastOpponents";

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

        <section className="friends-section">
          <PastOpponents />
        </section>
      </div>
    </div>
  );
}