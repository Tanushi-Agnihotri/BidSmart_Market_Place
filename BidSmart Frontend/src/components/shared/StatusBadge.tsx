import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Live', className: 'bg-success/20 text-success border-success/30 shadow-[0_0_8px_hsl(152_60%_36%/0.15)]' },
  'ending-soon': { label: 'Ending Soon', className: 'bg-warning/20 text-warning border-warning/30 shadow-[0_0_8px_hsl(38_92%_50%/0.15)]' },
  upcoming: { label: 'Upcoming', className: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30 shadow-[0_0_8px_hsl(217_89%_55%/0.15)]' },
  closed: { label: 'Closed', className: 'bg-muted/80 text-muted-foreground border-border' },
};

const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
  const config = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md",
      config.className
    )}>
      {status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
      {status === 'ending-soon' && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
