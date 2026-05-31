import 'server-only';
import { createServerSupabase } from '@/lib/supabase';
import { userChannel, type NotificationEvent } from './messages';

// One-off server-side broadcast into a user's personal notification channel.
// Mirrors the duel serverBroadcast pattern: open channel, send, tear down.
export async function notifyUser(userId: string, event: NotificationEvent): Promise<void> {
  const supabase = createServerSupabase();
  const channel = supabase.channel(userChannel(userId));

  await new Promise<void>((resolve) => {
    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        channel
          .send({ type: 'broadcast', event: 'notification', payload: event })
          .then(() => supabase.removeChannel(channel))
          .then(() => resolve())
          .catch(() => resolve());
      }
    });
  });
}
