import { Waves } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function SimulationPage() {
  return (
    <>
      <Header title="Simulation" />
      <div className="p-8">
        <EmptyState
          icon={Waves}
          title="Simulation not yet available"
          description="Model how changes to activity data would affect your total footprint."
          actionLabel="Run a simulation"
        />
      </div>
    </>
  );
}
