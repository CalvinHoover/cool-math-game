// import FriendsTester from "@/features/friends/FriendsTester";
import FriendsList from "@/features/friends/FriendsList";
import FriendSearch from "@/features/friends/FriendSearch";
import PastOpponents from "@/features/friends/PastOpponents";

export default function FriendsPage() {
  return (
    <main>
      <FriendSearch />
      <FriendsList />
      <PastOpponents />
    </main>
  );
}