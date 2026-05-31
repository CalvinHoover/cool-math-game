import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const api = vi.hoisted(() => ({
  searchUsers: vi.fn(),
  getFriendStatus: vi.fn(),
  sendFriendRequest: vi.fn(),
}));

vi.mock('@/features/friends/api', () => api);

import AddFriendSearch from '@/features/friends/components/AddFriendSearch';
import IncomingRequests from '@/features/friends/components/IncomingRequests';
import FriendsList from '@/features/friends/components/FriendsList';

const bob = { id: 'bob', username: 'bob', level: 5 };

const NOT_RELATED = { isFriend: false, incomingRequest: false, outgoingRequest: false };

beforeEach(() => {
  vi.clearAllMocks();
  api.searchUsers.mockResolvedValue([bob]);
});

async function typeQuery() {
  fireEvent.change(screen.getByLabelText('Search users by username'), {
    target: { value: 'bob' },
  });
}

describe('AddFriendSearch disabled states', () => {
  it('enables "Add Friend" when there is no relationship', async () => {
    api.getFriendStatus.mockResolvedValue(NOT_RELATED);
    render(<AddFriendSearch />);
    await typeQuery();
    const btn = await screen.findByRole('button', { name: 'Add Friend' });
    expect(btn).toBeEnabled();
  });

  it('disables and shows "Friends" when already friends', async () => {
    api.getFriendStatus.mockResolvedValue({ ...NOT_RELATED, isFriend: true });
    render(<AddFriendSearch />);
    await typeQuery();
    const btn = await screen.findByRole('button', { name: 'Friends' });
    expect(btn).toBeDisabled();
  });

  it('disables and shows "Requested" when an outgoing request exists', async () => {
    api.getFriendStatus.mockResolvedValue({ ...NOT_RELATED, outgoingRequest: true });
    render(<AddFriendSearch />);
    await typeQuery();
    const btn = await screen.findByRole('button', { name: 'Requested' });
    expect(btn).toBeDisabled();
  });

  it('disables and shows "Respond" when an incoming request exists', async () => {
    api.getFriendStatus.mockResolvedValue({ ...NOT_RELATED, incomingRequest: true });
    render(<AddFriendSearch />);
    await typeQuery();
    const btn = await screen.findByRole('button', { name: 'Respond' });
    expect(btn).toBeDisabled();
  });

  it('sends a request and switches to "Requested" on click', async () => {
    api.getFriendStatus.mockResolvedValue(NOT_RELATED);
    api.sendFriendRequest.mockResolvedValue({});
    render(<AddFriendSearch />);
    await typeQuery();
    const btn = await screen.findByRole('button', { name: 'Add Friend' });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(api.sendFriendRequest).toHaveBeenCalledWith('bob');
    });
    expect(await screen.findByRole('button', { name: 'Requested' })).toBeDisabled();
  });
});

describe('IncomingRequests', () => {
  it('shows empty state with no requests', () => {
    render(<IncomingRequests requests={[]} onAccept={vi.fn()} onDeny={vi.fn()} />);
    expect(screen.getByText('No pending requests.')).toBeInTheDocument();
  });

  it('calls onAccept with the request id', async () => {
    const onAccept = vi.fn().mockResolvedValue(undefined);
    render(
      <IncomingRequests
        requests={[{ id: 'r1', fromUser: bob, toUser: bob, status: 'pending', createdAt: '' }]}
        onAccept={onAccept}
        onDeny={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(onAccept).toHaveBeenCalledWith('r1'));
  });
});

describe('FriendsList', () => {
  it('shows empty state with no friends', () => {
    render(<FriendsList friends={[]} />);
    expect(screen.getByText('No friends yet.')).toBeInTheDocument();
  });

  it('renders a remove button only when onRemove is provided', () => {
    const friend = { profile: bob, status: { ...NOT_RELATED, isFriend: true } };
    const { rerender } = render(<FriendsList friends={[friend]} />);
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
    rerender(<FriendsList friends={[friend]} onRemove={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });
});
