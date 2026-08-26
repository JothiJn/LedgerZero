import { Activity } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function StatusPage() {
  return (
    <>
      <Header title="Status Overview" />
      <div className="p-8">
        <EmptyState
          icon={Activity}
          title="System status: all pipelines nominal"
          description="OCR, AI extraction, and calculation services are running normally."
        />
      </div>
    </>
  );
}
