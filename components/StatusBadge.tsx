import { cn, getStatusColor } from '@/lib/utils';
import type { ItemStatus } from '@/lib/types';

const STATUS_LABELS: Record<ItemStatus, string> = {
  open:          'Open',
  claim_pending: 'Claim Pending',
  resolved:      'Resolved',
};

interface StatusBadgeProps {
  status: ItemStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full',
        getStatusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
