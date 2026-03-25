'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-700">
            GolfGives
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/charities" className="text-sm text-gray-600 hover:text-gray-900">
              Charities
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/subscribe">
                      <Button size="sm">Subscribe</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/charities" className="block py-2 text-sm text-gray-600">
              Charities
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2 text-sm text-gray-600">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block py-2 text-sm text-gray-500">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-sm text-gray-600">
                  Sign In
                </Link>
                <Link href="/subscribe" className="block py-2 text-sm text-brand-600 font-medium">
                  Subscribe
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
