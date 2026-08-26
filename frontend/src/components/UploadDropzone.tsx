'use client';

// Client Component: uses hooks + browser file APIs, so it must carry the
// 'use client' directive — this is what was missing in the original bug.

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadInvoice, simulateDemoPipeline } from '@/lib/data';
import { isDemoMode } from '@/lib/supabase';
import { Invoice } from '@/lib/types';

export default function UploadDropzone({
  userId,
  onUploaded,
}: {
  userId: string | null;
  onUploaded: (invoice: Invoice, isUpdate?: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const invoice = await uploadInvoice(files[0], userId);
      onUploaded(invoice);
      // In demo mode, fake the n8n pipeline advancing this invoice so the
      // realtime-style status updates are visible without a real backend.
      // In production this is unnecessary — the Supabase Realtime
      // subscription in InvoiceTable.tsx handles live updates instead.
      simulateDemoPipeline(invoice.id, (updated) => onUploaded(updated, true));
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed — check the console for details.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 mb-6 cursor-pointer hover:border-teal hover:bg-teal-light transition-colors"
    >
      <Upload size={34} className="mx-auto mb-2.5 opacity-70" />
      <div className="text-sm font-semibold text-gray-800 mb-1">
        {busy ? 'Uploading…' : 'Drop invoice or receipt here, or click to browse'}
      </div>
      <div className="text-xs">
        PDF, PNG, JPG — uploads directly to Supabase Storage
        {isDemoMode && ' (demo mode: simulated locally)'}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
