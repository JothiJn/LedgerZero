import { Mail } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function RequestPage() {
  return (
    <>
      <Header title="Request" />
      <div className="p-8">
        <EmptyState
          icon={Mail}
          title="No pending requests"
          description="Data requests sent to collaborators or suppliers will appear here."
          actionLabel="+ New request"
        />
      </div>
    </>
  );
}
