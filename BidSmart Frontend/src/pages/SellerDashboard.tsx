import { useState, useEffect } from 'react';
import {
  MdOutlineInventory as Package,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineTrendingUp as TrendingUp,
  MdOutlineVisibility as Eye,
  MdOutlineAdd as Plus,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { categories } from '@/data/mockData';
import { toast } from 'sonner';
import { auctionApi, ApiError } from '@/lib/apiService';
import SellerAccessGate from '@/components/shared/SellerAccessGate';

const SellerDashboard = () => {
  const { currentUser, currentRole, authToken, auctions, bids, refreshAuctions } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const [addingProduct, setAddingProduct] = useState(false);
  const [dlgTitle, setDlgTitle] = useState('');
  const [dlgCategory, setDlgCategory] = useState('');
  const [dlgCondition, setDlgCondition] = useState('');
  const [dlgDescription, setDlgDescription] = useState('');
  const [dlgBasePrice, setDlgBasePrice] = useState('');
  const [dlgBidIncrement, setDlgBidIncrement] = useState('');

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authToken) {
      toast.error('Please sign in with your account to list products.');
      return;
    }
    if (!dlgTitle || !dlgCategory || !dlgCondition || !dlgBasePrice || !dlgBidIncrement) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setAddingProduct(true);
    try {
      await auctionApi.create({
        title: dlgTitle,
        category: dlgCategory,
        condition: dlgCondition,
        description: dlgDescription,
        basePrice: parseFloat(dlgBasePrice),
        bidIncrement: parseFloat(dlgBidIncrement),
        durationHours: 24,
      });
      toast.success('Product listed successfully!');
      await refreshAuctions();
      setDialogOpen(false);
      // Reset form
      setDlgTitle(''); setDlgCategory(''); setDlgCondition('');
      setDlgDescription(''); setDlgBasePrice(''); setDlgBidIncrement('');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to list product';
      toast.error(message);
    } finally {
      setAddingProduct(false);
    }
  };

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

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />
      <div className="pointer-events-none absolute -top-10 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative container mx-auto px-4">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/20 to-border shadow-card mb-8">
          <div className="relative rounded-3xl bg-card/90 backdrop-blur-sm p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-2xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 shadow-lg">
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
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2">
                      <Plus className="h-4 w-4" /> List Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl">List New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4 mt-2">
                      <div>
                        <label className="text-base font-medium text-foreground mb-1.5 block">Title</label>
                        <Input value={dlgTitle} onChange={e => setDlgTitle(e.target.value)} placeholder="e.g., Vintage Rolex Submariner" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-base font-medium text-foreground mb-1.5 block">Category</label>
                          <Select value={dlgCategory} onValueChange={setDlgCategory}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {categories.map(c => (
                                <SelectItem key={c.name} value={c.name}>
                                  <div className="flex items-center gap-2">
                                    {c.icon}
                                    <span>{c.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-base font-medium text-foreground mb-1.5 block">Condition</label>
                          <Select value={dlgCondition} onValueChange={setDlgCondition}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-base font-medium text-foreground mb-1.5 block">Description</label>
                        <Textarea value={dlgDescription} onChange={e => setDlgDescription(e.target.value)} placeholder="Describe your item..." rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-base font-medium text-foreground mb-1.5 block">Base Price (₹)</label>
                          <Input type="number" min="1" value={dlgBasePrice} onChange={e => setDlgBasePrice(e.target.value)} placeholder="0.00" required />
                        </div>
                        <div>
                          <label className="text-base font-medium text-foreground mb-1.5 block">Bid Increment (₹)</label>
                          <Input type="number" min="1" value={dlgBidIncrement} onChange={e => setDlgBidIncrement(e.target.value)} placeholder="100" required />
                        </div>
                      </div>
                      <button type="submit" disabled={addingProduct} className="w-full rounded-xl bg-primary py-2.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70">
                        {addingProduct ? 'Listing...' : 'List Product'}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard icon={Package} label="Active Listings" value={String(activeCount)} />
          <StatsCard icon={RupeeSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
          <StatsCard icon={TrendingUp} label="Bids Received" value={String(totalBidsReceived)} />
          <StatsCard icon={Eye} label="Total Views" value={String(totalViews)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Products Table */}
          <div className="lg:col-span-2">
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
            <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
              <div className="rounded-2xl bg-card/90 backdrop-blur-sm overflow-hidden">
                {myAuctions.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <p className="font-display text-xl font-semibold mb-1">No products listed yet</p>
                    <p className="text-sm text-muted-foreground mb-5">Create your first listing to start receiving bids.</p>
                    <Button onClick={() => setDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> List Your First Product
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
                          <tr key={auction.id} className={cn("group transition-colors hover:bg-muted/40", i !== myAuctions.length - 1 && "border-b border-border")}>
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
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Insights className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Revenue Trend</h2>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
                <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-5">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">6-Month Total</p>
                      <p className="font-mono text-2xl font-bold text-primary mt-0.5">
                        ₹{monthlyRevenue.reduce((s, m) => s + m.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success text-xs font-semibold px-2.5 py-1 border border-success/15">
                      <TrendingUp className="h-3 w-3" /> Trending
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {monthlyRevenue.map(m => (
                      <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group">
                        <span className="text-xs font-mono text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{(m.amount / 1000).toFixed(1)}k
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/40 transition-all duration-500 group-hover:from-primary group-hover:to-primary/60 shadow-sm"
                          style={{ height: `${(m.amount / maxRevenue) * 100}%`, minHeight: 8 }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Bolt className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold">Recent Bids</h2>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
                <div className="rounded-2xl bg-card/90 backdrop-blur-sm overflow-hidden">
                  {recentBids.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bolt className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No bids yet. They'll appear here as they come in.</p>
                    </div>
                  ) : (
                    recentBids.map((bid, i, arr) => {
                      const auction = auctions.find(a => a.id === bid.auctionId);
                      const initials = bid.bidderName.split(' ').map(n => n[0]).join('').slice(0, 2);
                      return (
                        <div
                          key={bid.id}
                          className={cn(
                            "px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors",
                            i !== arr.length - 1 && "border-b border-border"
                          )}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shrink-0">
                            <span className="text-sm font-semibold text-primary">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{bid.bidderName}</p>
                            <p className="text-xs text-muted-foreground truncate">on {auction?.title}</p>
                          </div>
                          <span className="font-mono text-sm font-bold text-primary shrink-0">₹{bid.amount.toLocaleString()}</span>
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
