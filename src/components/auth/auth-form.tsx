'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    selectedCharityId: '',
    charityPercentage: 10,
  });

  const supabase = createClient();

  useEffect(() => {
    if (mode !== 'signup') return;

    async function loadCharities() {
      const { data } = await supabase
        .from('charities')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (data) setCharities(data);
    }

    loadCharities();
  }, [mode, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              selected_charity_id: formData.selectedCharityId || '',
              charity_percentage: formData.charityPercentage,
            },
          },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-gray-500">
          {mode === 'login'
            ? 'Sign in to access your dashboard'
            : 'Join the platform and start making a difference'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="John Smith"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Choose Your Charity
              </label>
              <select
                required
                value={formData.selectedCharityId}
                onChange={(e) => setFormData({ ...formData, selectedCharityId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Select a charity</option>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Charity Contribution: {formData.charityPercentage}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={formData.charityPercentage}
                onChange={(e) => setFormData({ ...formData, charityPercentage: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10% minimum</span>
                <span>100%</span>
              </div>
            </div>
          </>
        )}

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
