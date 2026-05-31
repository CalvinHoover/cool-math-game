import type { PublicProfile } from '../profile/types';

export type NotificationEvent =
  | { type: 'friend_request_received'; fromUser: PublicProfile }
  | { type: 'friend_request_accepted'; byUser: PublicProfile };

const VALID_TYPES = new Set([
  'friend_request_received',
  'friend_request_accepted',
]);

export function isNotificationEvent(value: unknown): value is NotificationEvent {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.type === 'string' && VALID_TYPES.has(obj.type);
}

export function userChannel(userId: string): string {
  return `user:${userId}:notifications`;
}
