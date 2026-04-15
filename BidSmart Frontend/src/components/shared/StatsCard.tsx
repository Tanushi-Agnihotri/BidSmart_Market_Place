import { type IconType } from 'react-icons';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: IconType;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  accent?: string;
}

const StatsCard = ({ icon: Icon, label, value, change, positive, accent }: StatsCardProps) => (
  <div className="group relative rounded-2xl bg-card border border-border/80 p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 overflow-hidden">
    {/* Subtle top accent line */}
    <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity")} />

    <div className="flex items-start justify-between">
      <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 p-2.5 border border-primary/10 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {change && (
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-bold",
          positive ? 'bg-success/10 text-success border border-success/15' : 'bg-destructive/10 text-destructive border border-destructive/15'
        )}>
          {positive ? '+' : ''}{change}
        </span>
      )}
    </div>
    <p className="mt-4 font-mono text-3xl font-bold text-foreground tracking-tight leading-none">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground font-medium">{label}</p>
  </div>
);

export default StatsCard;
