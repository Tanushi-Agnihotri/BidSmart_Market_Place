import { useState, useMemo, useEffect } from 'react';
import {
  MdOutlineGavel as Gavel,
  MdOutlineEmojiEvents as Trophy,
  MdOutlineWarningAmber as AlertTriangle,
  MdOutlineCheckCircle as CheckCircle2,
  MdOutlineCancel as XCircle,
  MdOutlineSearch as Search,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineArrowForward as ArrowRight,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { cn } from '@/lib/utils';

type BidTab = 'all' | 'winning' | 'outbid' | 'won' | 'lost';

const tabConfig: { value: BidTab; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Bids', icon: Gavel },
  { value: 'winning', label: 'Winning', icon: Trophy },
  { value: 'outbid', label: 'Outbid', icon: AlertTriangle },
  { value: 'won', label: 'Won', icon: CheckCircle2 },
  { value: 'lost', label: 'Lost', icon: XCircle },
];

type SortOption = 'newest' | 'price-high' | 'price-low' | 'bids' | 'ending';

const MyBids = () => {
  const { currentUser, auctions, bids, refreshAuctions, refreshBids } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Refresh data on mount to ensure latest auction statuses and bids are loaded
  useEffect(() => {
    refreshAuctions();
    refreshBids();
  }, [refreshAuctions, refreshBids]);

  const myBids = bids.filter(b => b.bidderId === currentUser?.id);
  const myAuctionIds = [...new Set(myBids.map(b => b.auctionId))];

  const getBidStatus = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return 'lost';
    const auctionBids = bids.filter(b => b.auctionId === auctionId).sort((a, b) => b.amount - a.amount);
    const isTopBidder = auctionBids[0]?.bidderId === currentUser?.id;
    const hasEnded = auction.status === 'closed' || new Date(auction.endTime).getTime() <= Date.now();
    if (hasEnded) return isTopBidder ? 'won' : 'lost';
    return isTopBidder ? 'winning' : 'outbid';
  };

  const auctionEntries = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let entries = myAuctionIds.map(auctionId => {
      const auction = auctions.find(a => a.id === auctionId)!;
      const myHighest = myBids
        .filter(b => b.auctionId === auctionId)
        .sort((a, b) => b.amount - a.amount)[0];
      const status = getBidStatus(auctionId);
      return { auction, myHighest, status };
    }).filter(e => e.auction);

    if (q) {
      entries = entries.filter(e =>
        e.auction.title.toLowerCase().includes(q) || e.auction.category.toLowerCase().includes(q)
      );
    }

    entries.sort((a, b) => {
      switch (sortBy) {
        case 'price-high': return b.auction.currentBid - a.auction.currentBid;
        case 'price-low': return a.auction.currentBid - b.auction.currentBid;
        case 'bids': return b.auction.totalBids - a.auction.totalBids;
        case 'ending': return new Date(a.auction.endTime).getTime() - new Date(b.auction.endTime).getTime();
        default: return new Date(b.myHighest.timestamp).getTime() - new Date(a.myHighest.timestamp).getTime();
      }
    });

    return entries;
  }, [myBids, auctions, debouncedSearch, sortBy]);

  const filterEntries = (tab: BidTab) =>
    tab === 'all' ? auctionEntries : auctionEntries.filter(e => e.status === tab);

  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    winning: { label: 'Winning', className: 'bg-success/15 text-success border-success/25', icon: Trophy },
    outbid: { label: 'Outbid', className: 'bg-warning/15 text-warning border-warning/25', icon: AlertTriangle },
    won: { label: 'Won', className: 'bg-primary/15 text-primary border-primary/25', icon: CheckCircle2 },
    lost: { label: 'Lost', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  };

  // Summary stats
  const stats = useMemo(() => {
    const winning = auctionEntries.filter(e => e.status === 'winning').length;
    const won = auctionEntries.filter(e => e.status === 'won').length;
    const outbid = auctionEntries.filter(e => e.status === 'outbid').length;
    const lost = auctionEntries.filter(e => e.status === 'lost').length;
    const totalBidValue = auctionEntries.reduce((sum, e) => sum + (e.myHighest?.amount || 0), 0);
    return { winning, won, outbid, lost, totalBidValue, total: auctionEntries.length };
  }, [auctionEntries]);

  const renderList = (tab: BidTab) => {
    const entries = filterEntries(tab);
    if (entries.length === 0) {
      return (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="relative px-6 py-14 text-center">
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <Gavel className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-1">No bids in this category yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Start bidding on active auctions to see them here.</p>
            <Button asChild className="gap-2">
              <Link to="/auctions">
                <Search className="h-4 w-4" /> Browse Auctions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {entries.map(({ auction, myHighest, status }) => {
          const cfg = statusConfig[status];
          const StatusIcon = cfg.icon;
          return (
            <Link
              key={auction.id}
              to={`/auctions/${auction.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-elegant hover:-translate-y-0.5"
            >
              <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border">
                {auction.images?.[0] ? (
                  <img src={auction.images[0]} alt={auction.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Gavel className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-base font-semibold truncate group-hover:text-primary transition-colors">{auction.title}</h3>
                  <span className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border",
                    cfg.className
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Your bid: <span className="font-mono font-semibold text-foreground">₹{myHighest?.amount.toLocaleString()}</span></span>
                  <span>Current: <span className="font-mono font-semibold text-primary">₹{auction.currentBid.toLocaleString()}</span></span>
                  <span className="text-xs">·</span>
                  <span>{auction.totalBids} bids</span>
                </div>
              </div>
              <div className="shrink-0 text-right min-w-[80px]">
                {auction.status !== 'closed' ? (
                  <CountdownTimer endTime={auction.endTime} compact />
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Ended
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
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
                    <Gavel className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Your Activity
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    My Bids
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Track every bid you've placed — winning, outbid, won, and lost — all in one place.
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" size="lg" className="gap-2 self-start lg:self-center">
                <Link to="/auctions">
                  <Search className="h-4 w-4" /> Browse Auctions
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-mono text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Winning</p>
                <Trophy className="h-4 w-4 text-success" />
              </div>
              <p className="font-mono text-2xl font-bold text-success">{stats.winning}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Outbid</p>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <p className="font-mono text-2xl font-bold text-warning">{stats.outbid}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Won</p>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="font-mono text-2xl font-bold text-primary">{stats.won}</p>
            </div>
            <div className="col-span-2 md:col-span-1 rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Bid Value</p>
                <RupeeSign className="h-4 w-4 text-primary" />
              </div>
              <p className="font-mono text-2xl font-bold text-primary">₹{stats.totalBidValue.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your bids..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
              <SelectItem value="bids">Most Bids</SelectItem>
              <SelectItem value="ending">Ending Soonest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-card border border-border h-auto flex-wrap p-1">
            {tabConfig.map(tab => {
              const count = filterEntries(tab.value).length;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-xs font-mono transition-colors",
                    "bg-muted data-[state=active]:bg-primary-foreground/20",
                    "group-data-[state=active]:bg-primary-foreground/20"
                  )}>
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabConfig.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {renderList(tab.value)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MyBids;
