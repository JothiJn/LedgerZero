import { LandPlot } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function BoundariesPage() {
  return (
    <>
      <Header title="Boundaries" />
      <div className="p-8">
        <EmptyState
          icon={LandPlot}
          title="No organizational boundaries defined yet"
          description="Boundaries let you define which entities, facilities, or operations are included in your emissions inventory."
          actionLabel="+ Add boundary"
        />
      </div>
    </>
  );
}
