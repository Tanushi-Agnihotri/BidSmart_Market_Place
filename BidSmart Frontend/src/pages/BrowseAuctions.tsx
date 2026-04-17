import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MdOutlineSearch as Search,
  MdOutlineTune as SlidersHorizontal,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineClose as X,
  MdOutlineBolt as Bolt,
  MdOutlineTimer as Timer,
  MdOutlineGavel as Gavel,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import AuctionCard from '@/components/shared/AuctionCard';
import { categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import heroImg from '@/assets/About.jpg';

const ITEMS_PER_PAGE = 12;

const statusOptions: { value: string | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'closed', label: 'Closed' },
];

const BrowseAuctions = () => {
  const { auctions } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('ending-soon');
  const [currentPage, setCurrentPage] = useState(1);

  // Global counts (independent of filters) — used for hero summary
  const globalStats = useMemo(() => ({
    total: auctions.length,
    live: auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length,
    endingSoon: auctions.filter(a => a.status === 'ending-soon').length,
  }), [auctions]);

  const filtered = useMemo(() => {
    let result = auctions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.sellerName && a.sellerName.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) result = result.filter(a => a.category === selectedCategory);
    if (selectedStatus) result = result.filter(a => a.status === selectedStatus);
    if (sortBy === 'ending-soon') result = [...result].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.currentBid - a.currentBid);
    else if (sortBy === 'price-low') result = [...result].sort((a, b) => a.currentBid - b.currentBid);
    else if (sortBy === 'most-bids') result = [...result].sort((a, b) => b.totalBids - a.totalBids);
    return result;
  }, [auctions, search, selectedCategory, selectedStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAuctions = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleFilterChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(search || selectedCategory || selectedStatus);
  const clearAll = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedStatus(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero header with background */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Badge — floating above the auctioneer */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-md border border-primary/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Bolt className="h-3.5 w-3.5 text-primary" /> Live Marketplace
          </span>
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-16 text-center">
          <div className="mb-8 animate-float-up max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
              Explore <span className="bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">Auctions</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mt-4 max-w-xl mx-auto drop-shadow-md">
              Discover extraordinary items from verified sellers — bid, watch, and win pieces you'll treasure.
            </p>

          </div>

          {/* Glass card wrapping stats + search */}
          <div className="max-w-3xl mx-auto animate-float-up delay-200 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl px-6 py-5" style={{ animationFillMode: 'both' }}>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
                  <Gavel className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white text-sm leading-none">{globalStats.total}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Total</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 border border-green-500/40">
                  {globalStats.live > 0 ? (
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                    </span>
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-white/20" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white text-sm leading-none">{globalStats.live}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Live</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/40">
                  <Timer className="h-4 w-4 text-warning" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white text-sm leading-none">{globalStats.endingSoon}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Ending Soon</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-white/10 mb-4" />

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search by title, category, or seller..."
                  value={search}
                  onChange={e => handleFilterChange(setSearch, e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-white/15 transition-all"
                />
                {search && (
                  <button onClick={() => handleFilterChange(setSearch, '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white" aria-label="Clear search">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    showFilters
                      ? "border-primary/60 bg-primary/30 text-primary"
                      : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {selectedStatus && (
                    <span className="rounded-full bg-primary text-primary-foreground text-xs font-mono px-1.5 min-w-[18px] text-center">1</span>
                  )}
                </button>
                <select
                  value={sortBy}
                  onChange={e => handleFilterChange(setSortBy, e.target.value)}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="ending-soon" className="text-foreground bg-card">Ending Soon</option>
                  <option value="price-high" className="text-foreground bg-card">Price: High to Low</option>
                  <option value="price-low" className="text-foreground bg-card">Price: Low to High</option>
                  <option value="most-bids" className="text-foreground bg-card">Most Bids</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Always-visible category strip */}
          <div className="mb-6 relative -mx-4">
            {/* Fade edges to hint horizontal scroll */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => handleFilterChange(setSelectedCategory, null)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleFilterChange(setSelectedCategory, c.name)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border",
                    selectedCategory === c.name
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  )}
                >
                  <span className="text-base">{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
            </div>
          </div>

          {/* Advanced Filters Panel (toggle) */}
          {showFilters && (
            <div className="mb-6 relative overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-in">
              <div className="p-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(s => (
                      <button
                        key={s.value || 'all'}
                        onClick={() => handleFilterChange(setSelectedStatus, s.value)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-sm font-medium transition-all border",
                          selectedStatus === s.value
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/60 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results header — count + active filter chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 shadow-sm">
                <span className="font-mono text-base font-bold text-foreground">{filtered.length}</span>
                <span className="text-sm text-muted-foreground">auction{filtered.length !== 1 ? 's' : ''} found</span>
              </div>
              {hasActiveFilters && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  {search && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-medium">
                      Search: "{search}"
                      <button onClick={() => handleFilterChange(setSearch, '')} aria-label="Remove search">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-medium">
                      {selectedCategory}
                      <button onClick={() => handleFilterChange(setSelectedCategory, null)} aria-label="Remove category">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-medium">
                      {statusOptions.find(s => s.value === selectedStatus)?.label}
                      <button onClick={() => handleFilterChange(setSelectedStatus, null)} aria-label="Remove status">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors underline underline-offset-2"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {paginatedAuctions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {paginatedAuctions.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card mb-10">
              <div className="relative px-6 py-16 text-center">
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold mb-1">No auctions found</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                  Try adjusting your filters or search terms — or reset everything to see all auctions.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearAll} variant="outline" className="gap-2">
                    <X className="h-4 w-4" /> Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-16">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <MdOutlineChevronLeft className="h-4 w-4" /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - safePage) <= 2)
                .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={cn(
                        "rounded-lg px-3.5 py-2 text-sm font-medium transition-all min-w-[40px]",
                        safePage === item
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-card hover:bg-muted"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <MdOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BrowseAuctions;
