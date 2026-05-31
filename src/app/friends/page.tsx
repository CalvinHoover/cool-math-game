import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import FriendsView from "@/features/friends/components/FriendsView";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <FriendsView myId={session.id} />
    </main>
  );
}