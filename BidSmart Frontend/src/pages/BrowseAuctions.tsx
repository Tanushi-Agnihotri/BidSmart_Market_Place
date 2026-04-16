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
import heroImg from '@/assets/hero-auction.jpg';

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
    if (search) result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
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
      <section className="relative pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-background" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6 animate-float-up max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 mb-4">
              <Bolt className="h-3.5 w-3.5 text-primary" /> Live Marketplace
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Explore <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Auctions</span>
            </h1>
            <p className="text-base md:text-lg text-white/75 mt-2 max-w-xl">
              Discover extraordinary items from verified sellers — bid, watch, and win pieces you'll treasure.
            </p>

            {/* Mini stats — chip style */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 text-sm text-white/90">
                <Gavel className="h-4 w-4 text-primary" />
                <span className="font-mono font-bold text-white">{globalStats.total}</span>
                <span className="text-white/70">total</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 text-sm text-white/90">
                {globalStats.live > 0 ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/30" />
                )}
                <span className="font-mono font-bold text-white">{globalStats.live}</span>
                <span className="text-white/70">live</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 text-sm text-white/90">
                <Timer className="h-4 w-4 text-warning" />
                <span className="font-mono font-bold text-white">{globalStats.endingSoon}</span>
                <span className="text-white/70">ending soon</span>
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3 animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search by title, category, or seller..."
                value={search}
                onChange={e => handleFilterChange(setSearch, e.target.value)}
                className="w-full rounded-xl border border-white/25 bg-black/40 backdrop-blur-xl pl-10 pr-10 py-3 text-base text-white placeholder:text-white/70 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-black/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => handleFilterChange(setSearch, '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-3 text-base font-medium transition-all backdrop-blur-xl shadow-lg",
                  showFilters
                    ? "border-primary/60 bg-primary/40 text-white"
                    : "border-white/25 bg-black/40 text-white hover:bg-black/55"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {selectedStatus && (
                  <span className="rounded-full bg-primary text-primary-foreground text-xs font-mono px-1.5 min-w-[20px] text-center">
                    1
                  </span>
                )}
              </button>
              <select
                value={sortBy}
                onChange={e => handleFilterChange(setSortBy, e.target.value)}
                className="rounded-xl border border-white/25 bg-black/40 backdrop-blur-xl shadow-lg px-3 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="ending-soon" className="text-foreground bg-card">Ending Soon</option>
                <option value="price-high" className="text-foreground bg-card">Price: High to Low</option>
                <option value="price-low" className="text-foreground bg-card">Price: Low to High</option>
                <option value="most-bids" className="text-foreground bg-card">Most Bids</option>
              </select>
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
