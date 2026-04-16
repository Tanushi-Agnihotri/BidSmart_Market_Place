import { useEffect } from 'react';
import {
  MdOutlineInventory as Package,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineTrendingUp as TrendingUp,
  MdOutlineVisibility as Eye,
  MdOutlineMoreHoriz as MoreHorizontal,
  MdOutlineStorefront as Storefront,
  MdOutlineEmojiEvents as Trophy,
  MdOutlineArrowForward as ArrowRight,
  MdOutlineInsights as Insights,
  MdOutlineBolt as Bolt,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SellerAccessGate from '@/components/shared/SellerAccessGate';

const SellerDashboard = () => {
  const { currentUser, currentRole, auctions, bids, refreshAuctions } = useApp();

  // Refresh data on mount to ensure latest auction statuses are loaded
  useEffect(() => {
    refreshAuctions();
  }, [refreshAuctions]);

  const myAuctions = auctions.filter(a => a.sellerId === currentUser?.id);
  const activeCount = myAuctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length;
  const totalRevenue = myAuctions
    .filter(a => a.status === 'closed')
    .reduce((sum, a) => sum + a.currentBid, 0);
  const totalBidsReceived = myAuctions.reduce((sum, a) => sum + a.totalBids, 0);
  const totalViews = myAuctions.reduce((sum, a) => sum + a.watchlistCount, 0);

  // Revenue chart data (mock monthly)
  const monthlyRevenue = [
    { month: 'Oct', amount: 8200 },
    { month: 'Nov', amount: 12400 },
    { month: 'Dec', amount: 9800 },
    { month: 'Jan', amount: 15600 },
    { month: 'Feb', amount: 11300 },
    { month: 'Mar', amount: totalRevenue },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount));

  if (currentRole !== 'seller') {
    return (
      <SellerAccessGate
        feature="Seller Dashboard"
        description="The Seller Dashboard is where you manage listings, track performance, and view revenue across all your auctions."
      />
    );
  }

  const recentBids = bids
    .filter(b => myAuctions.some(a => a.id === b.auctionId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const statCards = [
    { icon: Package, label: 'Active Listings', value: String(activeCount), accent: 'from-amber-500/20 to-orange-500/10', iconBg: 'from-amber-500/25 to-orange-500/10', borderAccent: 'border-amber-500/20', textAccent: 'from-amber-400 to-orange-500' },
    { icon: RupeeSign, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, accent: 'from-emerald-500/20 to-green-500/10', iconBg: 'from-emerald-500/25 to-green-500/10', borderAccent: 'border-emerald-500/20', textAccent: 'from-emerald-400 to-green-500' },
    { icon: TrendingUp, label: 'Bids Received', value: String(totalBidsReceived), accent: 'from-blue-500/20 to-cyan-500/10', iconBg: 'from-blue-500/25 to-cyan-500/10', borderAccent: 'border-blue-500/20', textAccent: 'from-blue-400 to-cyan-500' },
    { icon: Eye, label: 'Total Views', value: String(totalViews), accent: 'from-violet-500/20 to-purple-500/10', iconBg: 'from-violet-500/25 to-purple-500/10', borderAccent: 'border-violet-500/20', textAccent: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />


      <div className="relative container mx-auto px-4">
        {/* Hero header */}
        <div className="relative animate-float-up">

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card mb-8">
            {/* Shimmer sweep overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" style={{ animation: 'shimmer 4s ease-in-out infinite', backgroundSize: '200% 100%' }} />
            </div>

            <div className="relative rounded-3xl bg-card/90 backdrop-blur-sm p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <Storefront className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div>
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                      Seller Zone
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Seller Dashboard
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      Welcome back{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''} — here's how your auctions are performing.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/seller/products">
                      <Package className="h-4 w-4" /> My Products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/seller/results">
                      <Trophy className="h-4 w-4" /> Results
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className={cn(
                "group relative rounded-2xl border border-border bg-card shadow-card animate-float-up overflow-hidden",
                i === 0 && 'delay-100',
                i === 1 && 'delay-200',
                i === 2 && 'delay-300',
                i === 3 && 'delay-400',
              )}
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="relative p-5 h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

                <div className="flex items-start justify-between relative">
                  <div className={cn("rounded-xl bg-gradient-to-br p-2.5 border transition-transform duration-300 group-hover:scale-110", card.iconBg, card.borderAccent)}>
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className={cn("mt-4 font-mono text-3xl font-bold tracking-tight leading-none bg-gradient-to-br bg-clip-text text-transparent", card.textAccent)}>
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground font-medium">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Products Table */}
          <div className="lg:col-span-2 animate-float-up delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Your Products</h2>
              </div>
              <Link to="/seller/products" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="overflow-hidden">
                {myAuctions.length === 0 ? (
                  <div className="relative p-16 text-center overflow-hidden">
                    {/* Gradient background for empty state */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-primary/10 blur-[60px]" />

                    <div className="relative inline-flex items-center justify-center mb-5">
                      <div className="absolute inset-0 h-20 w-20 rounded-2xl bg-primary/10 blur-xl mx-auto" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 animate-gentle-bounce">
                        <Package className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <p className="relative font-display text-xl font-semibold mb-1">No products listed yet</p>
                    <p className="relative text-sm text-muted-foreground mb-4">Create your first listing to start receiving bids.</p>
                    <Button asChild className="relative gap-2">
                      <Link to="/seller/products/new">
                        <Package className="h-4 w-4" /> Add Product
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">Current Bid</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">Bids</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">Time Left</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {myAuctions.map((auction, i) => (
                          <tr
                            key={auction.id}
                            className={cn(
                              "group transition-colors hover:bg-muted/40",
                              i !== myAuctions.length - 1 && "border-b border-border",
                              i % 2 === 1 && "bg-muted/15"
                            )}
                          >
                            <td className="px-5 py-3">
                              <Link to={`/auctions/${auction.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0 border border-border">
                                  {auction.images?.[0] ? (
                                    <img src={auction.images[0]} alt={auction.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full bg-muted flex items-center justify-center">
                                      <Package className="h-4 w-4 text-muted-foreground/40" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate max-w-[200px]">{auction.title}</p>
                                  <p className="text-sm text-muted-foreground">{auction.category}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-5 py-3"><StatusBadge status={auction.status} /></td>
                            <td className="px-5 py-3 text-right font-mono font-semibold text-primary">
                              {auction.currentBid > 0 ? `₹${auction.currentBid.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-5 py-3 text-right font-mono">{auction.totalBids}</td>
                            <td className="px-5 py-3 text-right">
                              {auction.status !== 'closed' && auction.status !== 'upcoming' ? (
                                <CountdownTimer endTime={auction.endTime} compact />
                              ) : (
                                <span className="text-sm text-muted-foreground">{auction.status === 'upcoming' ? 'Not started' : 'Ended'}</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Revenue Chart + Recent Bids */}
          <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="animate-float-up delay-600" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Insights className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Revenue Trend</h2>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="p-5">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">6-Month Total</p>
                      <p className="font-mono text-2xl font-bold bg-gradient-to-br from-primary to-amber-400 bg-clip-text text-transparent mt-0.5">
                        ₹{monthlyRevenue.reduce((s, m) => s + m.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success text-xs font-semibold px-2.5 py-1 border border-success/15">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </span>
                  </div>

                  {/* Chart area with subtle grid */}
                  <div className="relative">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '160px' }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="w-full border-t border-border/30" />
                      ))}
                    </div>

                    <div className="relative flex items-end gap-2 h-40">
                      {monthlyRevenue.map((m, i) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group">
                          {/* Tooltip-like hover value */}
                          <div className="relative opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1">
                            <div className="bg-foreground text-background text-xs font-mono font-semibold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                              ₹{(m.amount / 1000).toFixed(1)}k
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
                          </div>
                          <div
                            className="relative w-full rounded-t-lg overflow-hidden transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20"
                            style={{ height: `${(m.amount / maxRevenue) * 100}%`, minHeight: 8 }}
                          >
                            {/* Gradient bar with glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-amber-400/60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* Subtle glow effect */}
                            <div className="absolute -inset-1 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10" />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{m.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            <div className="animate-float-up delay-700" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Bolt className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Recent Bids</h2>
                {recentBids.length > 0 && (
                  <span className="relative flex h-2.5 w-2.5 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="overflow-hidden">
                  {recentBids.length === 0 ? (
                    <div className="relative p-8 text-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                      <div className="relative">
                        <Bolt className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No bids yet. They'll appear here as they come in.</p>
                      </div>
                    </div>
                  ) : (
                    recentBids.map((bid, i, arr) => {
                      const auction = auctions.find(a => a.id === bid.auctionId);
                      const initials = bid.bidderName.split(' ').map(n => n[0]).join('').slice(0, 2);
                      return (
                        <div
                          key={bid.id}
                          className={cn(
                            "px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-all duration-200",
                            i !== arr.length - 1 && "border-b border-border",
                            i % 2 === 1 && "bg-muted/10"
                          )}
                          style={{ animation: `fade-in 0.4s ease-out ${i * 80}ms both` }}
                        >
                          <div className="relative shrink-0">
                            {i === 0 && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                              </span>
                            )}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                              <span className="text-sm font-semibold text-primary">{initials}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{bid.bidderName}</p>
                            <p className="text-xs text-muted-foreground truncate">on {auction?.title}</p>
                          </div>
                          <span className="font-mono text-sm font-bold bg-gradient-to-br from-primary to-amber-400 bg-clip-text text-transparent shrink-0">₹{bid.amount.toLocaleString()}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
