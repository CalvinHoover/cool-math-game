import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetSession = vi.hoisted(() => vi.fn());
const mockSetSessionCookie = vi.hoisted(() => vi.fn());
const mockClearSessionCookie = vi.hoisted(() => vi.fn());
const authRepo = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  findUserByEmailOrUsername: vi.fn(),
  createUser: vi.fn(),
}));

const mockBcryptCompare = vi.hoisted(() => vi.fn());
const mockBcryptHash = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/session', () => ({
  getSession: mockGetSession,
  setSessionCookie: mockSetSessionCookie,
  clearSessionCookie: mockClearSessionCookie,
}));

vi.mock('@/features/auth/repository', () => ({
  AuthDBAccess: authRepo,
}));

vi.mock('bcryptjs', () => ({
  default: { compare: mockBcryptCompare, hash: mockBcryptHash },
  compare: mockBcryptCompare,
  hash: mockBcryptHash,
}));

// Import route handlers after mocks are registered
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';

const sessionUser = {
  id: 'user-1',
  username: 'test-user',
  email: 'test@example.com',
};

const dbUser = {
  ...sessionUser,
  password: 'hashed-password',
  elo: 1000,
  storyLine: 0,
  createdAt: new Date(),
};

function makeReq(body: unknown): Request {
  return new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/login', () => {
  it('returns 400 when fields are missing', async () => {
    const req = makeReq({ email: '', password: '' });
    const res = await loginPOST(req as NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('All fields are required');
  });

  it('returns 401 for invalid credentials', async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    const req = makeReq({ email: 'a@b.com', password: 'wrong' });
    const res = await loginPOST(req as NextRequest);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 503 when database is unavailable', async () => {
    authRepo.findUserByEmail.mockRejectedValue(new Error('db down'));
    const req = makeReq({ email: 'a@b.com', password: 'secret' });
    const res = await loginPOST(req as NextRequest);
    expect(res.status).toBe(503);
  });

  it('returns 200 and sets cookie on success', async () => {
    authRepo.findUserByEmail.mockResolvedValue(dbUser);
    mockBcryptCompare.mockResolvedValue(true);

    const req = makeReq({ email: dbUser.email, password: 'correct' });
    const res = await loginPOST(req as NextRequest);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.username).toBe(dbUser.username);
    expect(mockSetSessionCookie).toHaveBeenCalledWith({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
    });
  });
});

describe('POST /api/auth/register', () => {
  it('returns 400 when fields are missing', async () => {
    const req = makeReq({ username: '', email: '', password: '' });
    const res = await registerPOST(req as NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('All fields are required');
  });

  it('returns 400 when password is too short', async () => {
    const req = makeReq({ username: 'u', email: 'a@b.com', password: '123' });
    const res = await registerPOST(req as NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Password must be at least 6 characters');
  });

  it('returns 409 when email or username is taken', async () => {
    authRepo.findUserByEmailOrUsername.mockResolvedValue(dbUser);
    const req = makeReq({ username: 'u', email: 'a@b.com', password: 'password123' });
    const res = await registerPOST(req as NextRequest);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('Email or username already taken');
  });

  it('returns 503 when database is unavailable', async () => {
    authRepo.findUserByEmailOrUsername.mockRejectedValue(new Error('db down'));
    const req = makeReq({ username: 'u', email: 'a@b.com', password: 'password123' });
    const res = await registerPOST(req as NextRequest);
    expect(res.status).toBe(503);
  });

  it('returns 201 and sets cookie on success', async () => {
    authRepo.findUserByEmailOrUsername.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(dbUser);
    mockBcryptHash.mockResolvedValue('hashed-password');

    const req = makeReq({ username: 'new', email: 'new@example.com', password: 'password123' });
    const res = await registerPOST(req as NextRequest);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.username).toBe(dbUser.username);
    expect(mockSetSessionCookie).toHaveBeenCalledWith({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
    });
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 401 when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await logoutPOST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
    expect(mockClearSessionCookie).not.toHaveBeenCalled();
  });

  it('returns 200 and clears cookie when session exists', async () => {
    mockGetSession.mockResolvedValue(sessionUser);
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });
});
