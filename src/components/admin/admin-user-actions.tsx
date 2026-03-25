'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  currentRole: string;
}

export function AdminUserActions({ userId, currentRole }: Props) {
  const supabase = createClient();
  const router = useRouter();

  async function toggleRole() {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error(error.message);
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
