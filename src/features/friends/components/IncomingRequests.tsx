'use client';

import { useState } from 'react';
import type { FriendRequest } from '../types';

type IncomingRequestsProps = {
  requests: FriendRequest[];
  onAccept: (requestId: string) => Promise<void>;
  onDeny: (requestId: string) => Promise<void>;
};

export default function IncomingRequests({ requests, onAccept, onDeny }: IncomingRequestsProps) {
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function run(requestId: string, action: (id: string) => Promise<void>) {
    setBusy((prev) => ({ ...prev, [requestId]: true }));
    try {
      await action(requestId);
    } finally {
      setBusy((prev) => ({ ...prev, [requestId]: false }));
    }
  }

  return (
    <section className="border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-xl font-bold">Incoming Requests</h2>

      {requests.length === 0 ? (
        <p className="mt-2 text-gray-500">No pending requests.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <span>
                <span className="font-semibold">{request.fromUser.username}</span>
                <span className="ml-2 text-sm text-gray-500">Level {request.fromUser.level}</span>
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  disabled={busy[request.id]}
                  onClick={() => run(request.id, onAccept)}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm text-white disabled:bg-gray-400"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busy[request.id]}
                  onClick={() => run(request.id, onDeny)}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:bg-gray-400"
                >
                  Deny
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
