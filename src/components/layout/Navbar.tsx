'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  username: string;
}

export function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <span
            className="cursor-pointer text-lg font-bold text-blue-600 dark:text-blue-400"
            onClick={() => router.push('/dashboard')}
          >
            World of Math
          </span>
          <div className="hidden gap-4 sm:flex">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/practice" label="Practice" />
            <NavLink href="/profile" label="Profile" />
            <NavLink href="/friends" label="Friends" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar fallback={username} size="sm" />
          <span className="hidden text-sm font-medium text-gray-900 dark:text-gray-100 sm:inline">{username}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
    >
      {label}
    </button>
  );
}
