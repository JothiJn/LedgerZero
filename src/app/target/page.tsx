import { Target } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function TargetPage() {
  return (
    <>
      <Header title="Target" />
      <div className="p-8">
        <EmptyState
          icon={Target}
          title="No reduction targets set"
          description="Set science-based or custom targets to track progress over time."
          actionLabel="+ Set a target"
        />
      </div>
    </>
  );
}
