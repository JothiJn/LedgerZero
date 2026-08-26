import { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-5 text-gray-600">
      <Icon size={40} className="opacity-40 mb-4" />
      <h3 className="text-base font-semibold text-gray-800 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-4">{description}</p>
      {actionLabel && (
        <button
          disabled
          title="Not available yet — no backing table in the current schema"
          className="border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
