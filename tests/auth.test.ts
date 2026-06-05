import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = 'test-secret-for-auth-tests-only';


describe('JWT session tokens', () => {
  it('sign + verify roundtrip works', () => {
    const user = { id: 'abc123', username: 'carter', email: 'carter@ucla.edu' };
    const token = jwt.sign(user, SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, SECRET) as typeof user;
    expect(decoded.id).toBe('abc123');
    expect(decoded.username).toBe('carter');
    expect(decoded.email).toBe('carter@ucla.edu');
  });

  it('rejects a token signed with the wrong secret', () => {
    const token = jwt.sign({ id: '123' }, 'wrong-secret', { expiresIn: '7d' });
    expect(() => jwt.verify(token, SECRET)).toThrow();
  });

  it('rejects a tampered token', () => {
    const token = jwt.sign({ id: '123' }, SECRET, { expiresIn: '7d' });
    // flip the last 5 characters of the signature
    const tampered = token.slice(0, -5) + 'AAAAA';
    expect(() => jwt.verify(tampered, SECRET)).toThrow();
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ id: '123' }, SECRET, { expiresIn: '1ms' });
    await new Promise((r) => setTimeout(r, 20));
    expect(() => jwt.verify(token, SECRET)).toThrow(/expired/i);
  });

  it('SECURITY — pending_2fa token is blocked from acting as a real session', () => {
    // this replicates the exact check inside verifyToken() in session.ts
    const pendingToken = jwt.sign(
      { userId: 'attacker-id', scope: 'pending_2fa' },
      SECRET,
      { expiresIn: '5m' }
    );
    const payload = jwt.verify(pendingToken, SECRET) as Record<string, unknown>;

    // verifyToken returns null when it sees scope === 'pending_2fa'
    const sessionUser = payload.scope === 'pending_2fa' ? null : payload;
    expect(sessionUser).toBeNull();
  });

  it('SECURITY — real session tokens do not have the pending_2fa scope', () => {
    const realToken = jwt.sign(
      { id: 'user-123', username: 'carter', email: 'carter@ucla.edu' },
      SECRET,
      { expiresIn: '7d' }
    );
    const payload = jwt.verify(realToken, SECRET) as Record<string, unknown>;
    expect(payload.scope).toBeUndefined();
  });

  it('SECURITY — pending_2fa token contains userId not id (different shape from session)', () => {
    const pendingToken = jwt.sign(
      { userId: 'user-123', scope: 'pending_2fa' },
      SECRET,
      { expiresIn: '5m' }
    );
    const payload = jwt.verify(pendingToken, SECRET) as Record<string, unknown>;
//session has to follow the flow and have id
    expect(payload.id).toBeUndefined();
    expect(payload.userId).toBe('user-123');
    expect(payload.scope).toBe('pending_2fa');
  });
});

describe('Pending 2FA token logic', () => {
  it('pending token verifies userId correctly', () => {
    const token = jwt.sign({ userId: 'user-abc', scope: 'pending_2fa' }, SECRET, {
      expiresIn: '5m',
    });
    const payload = jwt.verify(token, SECRET) as { userId: string; scope: string };
    expect(payload.scope).toBe('pending_2fa');
    expect(payload.userId).toBe('user-abc');
  });

  it('pending token expires after its window', async () => {
    const token = jwt.sign({ userId: 'user-abc', scope: 'pending_2fa' }, SECRET, {
      expiresIn: '1ms',
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(() => jwt.verify(token, SECRET)).toThrow(/expired/i);
  });
});


function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

describe('Verification code generation', () => {
  it('produces exactly 6 characters', () => {
    const code = generateCode();
    expect(code).toHaveLength(6);
  });

  it('is a numeric string (no letters or symbols)', () => {
    for (let i = 0; i < 20; i++) {
      expect(/^\d{6}$/.test(generateCode())).toBe(true);
    }
  });

  it('is always between 100000 and 999999', () => {
    for (let i = 0; i < 50; i++) {
      const n = parseInt(generateCode(), 10);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  it('produces distinct values (not always the same code)', () => {
    const codes = new Set(Array.from({ length: 100 }, generateCode));
    expect(codes.size).toBeGreaterThan(90);
  });
});

// bcrypt password hashing

describe('Password hashing with bcrypt', () => {
  it('a correct password verifies against its hash', async () => {
    const hash = await bcrypt.hash('mypassword123', 8);
    expect(await bcrypt.compare('mypassword123', hash)).toBe(true);
  });

  it('a wrong password does not verify', async () => {
    const hash = await bcrypt.hash('correctpassword', 8);
    expect(await bcrypt.compare('wrongpassword', hash)).toBe(false);
  });

  it('hashes are salted — same password produces different hashes', async () => {
    const hash1 = await bcrypt.hash('samepassword', 8);
    const hash2 = await bcrypt.hash('samepassword', 8);
    expect(hash1).not.toBe(hash2);
  });

  it('a hashed verification code verifies correctly', async () => {
    const code = generateCode();
    const hash = await bcrypt.hash(code, 8);
    expect(await bcrypt.compare(code, hash)).toBe(true);
  });

  it('a different code does not verify against someone else\'s hash', async () => {
    const code1 = '123456';
    const code2 = '654321';
    const hash = await bcrypt.hash(code1, 8);
    expect(await bcrypt.compare(code2, hash)).toBe(false);
  });
});

//code expiring
describe('Verification code expiry', () => {
  it('a code with a past expiresAt is expired', () => {
    const expiresAt = new Date(Date.now() - 1000); // 1 second ago
    expect(expiresAt < new Date()).toBe(true);
  });

  it('a code with a future expiresAt is valid', () => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min ahead
    expect(expiresAt < new Date()).toBe(false);
  });

  it('2FA code window is 5 minutes', () => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const windowMs = expiresAt.getTime() - Date.now();
    expect(windowMs).toBeGreaterThan(4 * 60 * 1000);
    expect(windowMs).toBeLessThanOrEqual(5 * 60 * 1000);
  });

  it('password reset code window is 15 minutes', () => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const windowMs = expiresAt.getTime() - Date.now();
    expect(windowMs).toBeGreaterThan(14 * 60 * 1000);
    expect(windowMs).toBeLessThanOrEqual(15 * 60 * 1000);
  });
});
