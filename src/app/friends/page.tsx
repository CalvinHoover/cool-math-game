import "./Friends.css"

import FriendsList from "@/features/friends/FriendsList";
import FriendSearch from "@/features/friends/FriendSearch";
import BackButton from "@/components/interface/BackButton";

export default function FriendsPage() {
  return (
    <div className="friends-container">
      <div className="friends-inner">
        <BackButton />
        <h1 className="friends-title">Friends</h1>

        <section className="friends-section">
          <FriendSearch />
        </section>

        <section className="friends-section">
          <FriendsList showTitle={false} />
        </section>
      </div>
    </div>
  );
}
