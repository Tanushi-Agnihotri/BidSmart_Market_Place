import {
  MdOutlineFavorite as Heart,
  MdOutlineDelete as Trash,
  MdOutlineAutoAwesome as Sparkle,
  MdOutlineBookmark as Bookmark,
  MdOutlineTimer as Timer,
  MdOutlineGavel as Gavel,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineArrowForward as ArrowRight,
  MdOutlineSearch as Search,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import AuctionCard from '@/components/shared/AuctionCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Watchlist = () => {
  const { auctions, watchlist, toggleWatchlist } = useApp();
  const watchedAuctions = auctions.filter(a => watchlist.includes(a.id));

  const stats = {
    total: watchedAuctions.length,
    endingSoon: watchedAuctions.filter(a => a.status === 'ending-soon').length,
    active: watchedAuctions.filter(a => a.status === 'active').length,
    totalValue: watchedAuctions.reduce((sum, a) => sum + (a.currentBid || a.basePrice), 0),
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

      <div className="relative container mx-auto px-4">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card mb-8">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 shadow-lg">
                    <Heart className="h-7 w-7 text-primary fill-primary/30" />
                  </div>
                </div>
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Saved for Later
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    My Watchlist
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {watchedAuctions.length === 0
                      ? 'Pieces you save live here — a private shortlist of auctions to follow.'
                      : `Tracking ${watchedAuctions.length} auction${watchedAuctions.length !== 1 ? 's' : ''} — don't miss out when they close.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/auctions">
                    <Search className="h-4 w-4" /> Browse More
                  </Link>
                </Button>
                {watchedAuctions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => watchedAuctions.forEach(a => toggleWatchlist(a.id))}
                    className="gap-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" /> Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {watchedAuctions.length > 0 ? (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <Bookmark className="h-4 w-4 text-primary" />
                </div>
                <p className="font-mono text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Ending Soon</p>
                  <Timer className="h-4 w-4 text-warning" />
                </div>
                <p className="font-mono text-2xl font-bold text-warning">{stats.endingSoon}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <Gavel className="h-4 w-4 text-success" />
                </div>
                <p className="font-mono text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Combined Value</p>
                  <RupeeSign className="h-4 w-4 text-primary" />
                </div>
                <p className="font-mono text-2xl font-bold text-primary">₹{stats.totalValue.toLocaleString()}</p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {watchedAuctions.map(a => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          </>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="relative px-6 py-16 md:py-20 text-center">
              {/* Glowing sparkle */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 shadow-lg">
                  <Sparkle className="h-10 w-10 text-primary" />
                </div>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your watchlist is empty
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
                Tap the heart on any auction to save it here. We'll keep a close eye on bids and remind you before it closes.
              </p>

              {/* Feature tiles */}
              <div className="grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto mb-8 text-left">
                {[
                  { icon: Bookmark, label: 'Save instantly', desc: 'Bookmark any auction with one tap.' },
                  { icon: Timer, label: 'Closing alerts', desc: 'Get nudged before auctions end.' },
                  { icon: Gavel, label: 'Bid faster', desc: 'Jump straight to bidding from here.' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.label}
                      className="rounded-xl border border-border bg-background/40 p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auctions">
                    <Search className="h-4 w-4" /> Browse Auctions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
