'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  currentRole: string;
}

export function AdminUserActions({ userId, currentRole }: Props) {
  const router = useRouter();

  async function toggleRole() {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    const data = await res.json();

    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleRole}>
      {currentRole === 'admin' ? 'Demote' : 'Make Admin'}
    </Button>
  );
}
