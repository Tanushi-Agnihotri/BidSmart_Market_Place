import { useEffect } from 'react';
import { MdOutlineGavel, MdOutlineEmojiEvents, MdOutlineWarningAmber, MdOutlineFavorite, MdOutlineAccessTime, MdOutlineArrowForward, MdOutlineSearch, MdOutlineTrendingUp } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import StatsCard from '@/components/shared/StatsCard';
import AuctionCard from '@/components/shared/AuctionCard';
import CountdownTimer from '@/components/shared/CountdownTimer';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

const BuyerDashboard = () => {
  const { currentUser, auctions, bids, watchlist, refreshAuctions, refreshBids } = useApp();

  useEffect(() => {
    refreshAuctions();
    refreshBids();
  }, [refreshAuctions, refreshBids]);

  const myBids = bids.filter(b => b.bidderId === currentUser?.id);
  const myAuctionIds = [...new Set(myBids.map(b => b.auctionId))];
  const activeAuctions = auctions.filter(a => myAuctionIds.includes(a.id) && (a.status === 'active' || a.status === 'ending-soon'));

  const bidStatus = (auctionId: string) => {
    const auctionBids = bids.filter(b => b.auctionId === auctionId).sort((a, b) => b.amount - a.amount);
    if (auctionBids.length === 0) return 'none';
    return auctionBids[0].bidderId === currentUser?.id ? 'winning' : 'outbid';
  };

  const winningCount = activeAuctions.filter(a => bidStatus(a.id) === 'winning').length;
  const outbidCount = activeAuctions.filter(a => bidStatus(a.id) === 'outbid').length;

  const endingSoon = auctions
    .filter(a => (a.status === 'active' || a.status === 'ending-soon') && new Date(a.endTime).getTime() - Date.now() < 86400000 && new Date(a.endTime).getTime() > Date.now())
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    .slice(0, 3);

  const recommended = auctions
    .filter(a => !myAuctionIds.includes(a.id) && !watchlist.includes(a.id) && a.status === 'active')
    .slice(0, 4);

  const recentBids = myBids
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">

        {/* ── Hero Greeting ── */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 gradient-gold opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
          {/* Decorative glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10 blur-[50px] pointer-events-none" />

          <div className="relative px-8 py-10 md:py-12 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                {greeting}, {currentUser?.name?.split(' ')[0]}
              </h1>
              <p className="text-white/70 mt-1.5 text-base">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Link
              to="/auctions"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/25 hover:scale-[1.02]"
            >
              Browse Auctions <MdOutlineArrowForward className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard icon={MdOutlineGavel} label="Active Bids" value={String(activeAuctions.length)} />
          <StatsCard icon={MdOutlineEmojiEvents} label="Winning Bids" value={String(winningCount)} />
          <StatsCard icon={MdOutlineWarningAmber} label="Outbid" value={String(outbidCount)} />
          <StatsCard icon={MdOutlineFavorite} label="Watchlist" value={String(watchlist.length)} />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Active Bids */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold">Your Active Bids</h2>
              <Link to="/buyer/my-bids" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                View All <MdOutlineArrowForward className="h-3.5 w-3.5" />
              </Link>
            </div>
            {activeAuctions.length > 0 ? (
              <div className="space-y-3">
                {activeAuctions.map(auction => {
                  const status = bidStatus(auction.id);
                  const myHighest = bids
                    .filter(b => b.auctionId === auction.id && b.bidderId === currentUser?.id)
                    .sort((a, b) => b.amount - a.amount)[0];

                  return (
                    <Link
                      key={auction.id}
                      to={`/auctions/${auction.id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <img src={auction.images[0]} alt={auction.title} className="h-16 w-16 rounded-xl object-cover shrink-0 ring-1 ring-border transition-transform duration-300 group-hover:scale-105" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-base font-semibold truncate group-hover:text-primary transition-colors">{auction.title}</h3>
                          <span className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
                            status === 'winning' ? "bg-success/15 text-success border border-success/20" : "bg-warning/15 text-warning border border-warning/20"
                          )}>
                            {status === 'winning' ? '✓ Winning' : '↑ Outbid'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Your bid: <span className="font-mono font-semibold text-foreground">₹{myHighest?.amount.toLocaleString()}</span></span>
                          <span>Current: <span className="font-mono font-semibold text-primary">₹{auction.currentBid.toLocaleString()}</span></span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <CountdownTimer endTime={auction.endTime} compact />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MdOutlineSearch className="h-7 w-7" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">No active bids yet.</p>
                <Link to="/auctions" className="text-sm font-semibold text-primary hover:underline">Browse auctions</Link>
              </div>
            )}
          </div>

          {/* Ending Soon */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <h2 className="font-display text-2xl font-bold">Ending Soon</h2>
            </div>
            <div className="space-y-3">
              {endingSoon.map(auction => (
                <Link
                  key={auction.id}
                  to={`/auctions/${auction.id}`}
                  className="group block rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-warning/25 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={auction.images[0]} alt={auction.title} className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{auction.title}</h4>
                      <p className="text-xs text-muted-foreground">{auction.totalBids} bids</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-primary">₹{auction.currentBid.toLocaleString()}</span>
                    <CountdownTimer endTime={auction.endTime} compact />
                  </div>
                </Link>
              ))}
              {endingSoon.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                    <MdOutlineAccessTime className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">No auctions ending soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Recommended ── */}
        {recommended.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MdOutlineTrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">Recommended For You</h2>
              </div>
              <Link to="/auctions" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                View All <MdOutlineArrowForward className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommended.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          </div>
        )}

        {/* ── Recent Activity ── */}
        {recentBids.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {recentBids.map((bid, i) => {
                const auction = auctions.find(a => a.id === bid.auctionId);
                return (
                  <div
                    key={bid.id}
                    className={cn(
                      "group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40",
                      i !== recentBids.length - 1 && "border-b border-border/60"
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        You placed a bid of <span className="font-mono font-semibold text-primary">₹{bid.amount.toLocaleString()}</span> on{' '}
                        <Link to={`/auctions/${bid.auctionId}`} className="font-semibold hover:text-primary transition-colors">
                          {auction?.title || 'Unknown'}
                        </Link>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      {new Date(bid.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
