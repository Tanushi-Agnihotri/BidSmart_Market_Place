import { MdSwapVert, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

const SortableHeader = ({ label, sortKey, currentSort, currentDirection, onSort, className }: SortableHeaderProps) => {
  const isActive = currentSort === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
        isActive ? 'text-primary' : 'text-muted-foreground',
        className
      )}
    >
      {label}
      {isActive && currentDirection === 'asc' ? (
        <MdArrowUpward className="h-3.5 w-3.5" />
      ) : isActive && currentDirection === 'desc' ? (
        <MdArrowDownward className="h-3.5 w-3.5" />
      ) : (
        <MdSwapVert className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
};

export function useSortState(defaultKey: string | null = null, defaultDir: SortDirection = null) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultDir);

  const onSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  function sortItems<T>(items: T[], accessor: (item: T, key: string) => number | string): T[] {
    if (!sortKey || !sortDir) return items;
    return [...items].sort((a, b) => {
      const aVal = accessor(a, sortKey);
      const bVal = accessor(b, sortKey);
      const cmp = typeof aVal === 'number' && typeof bVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  return { sortKey, sortDir, onSort, sortItems };
}

import { useState } from 'react';

export default SortableHeader;
