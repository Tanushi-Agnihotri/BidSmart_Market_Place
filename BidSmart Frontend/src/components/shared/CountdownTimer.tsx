import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  compact?: boolean;
  onExpire?: () => void;
}

const CountdownTimer = ({ endTime, className, compact = false, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;

    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total: diff,
      };
    };

    const tick = () => {
      const result = calc();
      setTimeLeft(result);
      if (result.total <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  if (timeLeft.total <= 0) {
    return <span className={cn("font-mono text-sm text-destructive font-bold", className)}>Auction Ended</span>;
  }

  const isUrgent = timeLeft.total < 3600000;
  const isWarning = timeLeft.total < 86400000;

  const colorClass = isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground';
  const bgClass = isUrgent ? 'bg-destructive/8 border-destructive/15' : isWarning ? 'bg-warning/8 border-warning/15' : 'bg-muted/60 border-border';

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className={cn("h-1.5 w-1.5 rounded-full", isUrgent ? "bg-destructive animate-pulse" : isWarning ? "bg-warning animate-pulse" : "bg-primary")} />
        <span className={cn("font-mono font-bold text-sm", colorClass)}>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    );
  }

  const blocks = [
    ...(timeLeft.days > 0 ? [{ val: timeLeft.days, label: 'Days' }] : []),
    { val: timeLeft.hours, label: 'Hours' },
    { val: timeLeft.minutes, label: 'Min' },
    { val: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className={cn("flex gap-2", isUrgent && "animate-pulse", className)}>
      {blocks.map(b => (
        <div key={b.label} className={cn("flex flex-col items-center rounded-xl border px-3.5 py-2.5 min-w-[52px]", bgClass)}>
          <span className={cn("font-mono text-xl font-bold tabular-nums leading-none", colorClass)}>{String(b.val).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 font-semibold">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
