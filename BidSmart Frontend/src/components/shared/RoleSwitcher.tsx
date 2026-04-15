import { useApp } from '@/context/AppContext';
import type { UserRole } from '@/data/mockData';
import { cn } from '@/lib/utils';

const roles: { role: UserRole; label: string; emoji: string }[] = [
  { role: 'guest', label: 'Guest', emoji: '👤' },
  { role: 'buyer', label: 'Buyer', emoji: '🛒' },
  { role: 'seller', label: 'Seller', emoji: '🏪' },
  { role: 'admin', label: 'Admin', emoji: '🛡️' },
];

const RoleSwitcher = () => {
  const { currentRole, setRole } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="rounded-2xl bg-card border border-border p-2 shadow-elegant flex gap-1">
        {roles.map(r => (
          <button
            key={r.role}
            onClick={() => setRole(r.role)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold transition-all",
              currentRole === r.role
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {r.emoji} {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSwitcher;
