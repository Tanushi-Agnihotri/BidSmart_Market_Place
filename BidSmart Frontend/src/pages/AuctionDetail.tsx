import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdOutlineFavoriteBorder, MdOutlineFavorite, MdOutlineVisibility, MdOutlineGavel, MdOutlinePerson, MdOutlineLocationOn, MdOutlineArrowBack, MdOutlineCheck, MdOutlineImage, MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import CountdownTimer from '@/components/shared/CountdownTimer';
import StatusBadge from '@/components/shared/StatusBadge';
import AuctionCard from '@/components/shared/AuctionCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/apiService';

const POLL_INTERVAL = 10000; // 10 seconds

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auctions, bids, currentUser, watchlist, toggleWatchlist, placeBid, refreshBids, refreshAuctions } = useApp();
  const auction = auctions.find(a => a.id === id);
  const auctionBids = useMemo(() => bids.filter(b => b.auctionId === id).sort((a, b) => b.amount - a.amount), [bids, id]);
  const related = auctions.filter(a => a.id !== id && a.category === auction?.category).slice(0, 3);

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidding, setBidding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (auction) {
      const min = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.basePrice;
      setBidAmount(String(min));
    }
  }, [auction]);

  // Fetch bids from API for this auction
  useEffect(() => {
    if (id) refreshBids(id);
  }, [id, refreshBids]);

  // Auto-poll for bid updates and auction status changes
  useEffect(() => {
    if (!id || auction?.status === 'closed') return;

    const interval = setInterval(() => {
      refreshBids(id);
      refreshAuctions();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [id, auction?.status, refreshBids, refreshAuctions]);

  // Handle auction timer expiry
  const handleAuctionExpire = useCallback(() => {
    refreshAuctions();
    if (id) refreshBids(id);
  }, [refreshAuctions, refreshBids, id]);

  if (!auction) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="font-display text-2xl font-bold mt-4">Auction not found</h2>
          <Link to="/auctions" className="text-primary hover:underline mt-2 inline-block">Browse all auctions</Link>
        </div>
      </div>
    );
  }

  const isWatched = watchlist.includes(auction.id);
  const minBid = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.basePrice;

  const validateBid = (): boolean => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) { setBidError('Enter a valid amount'); return false; }
    if (amount < minBid) { setBidError(`Minimum bid is ₹${minBid.toLocaleString()}`); return false; }
    if (currentUser && currentUser.id === auction.sellerId) {
      setBidError('You cannot bid on your own auction');
      return false;
    }
    setBidError('');
    return true;
  };

  const handleBidClick = () => {
    if (!currentUser) {
      toast.error('Please log in to place a bid.');
      navigate('/login');
      return;
    }
    if (!validateBid()) return;
    setShowConfirm(true);
  };

  const handleWatchlistClick = () => {
    if (!currentUser) {
      toast.error('Please log in to save auctions to your watchlist.');
      navigate('/login');
      return;
    }
    toggleWatchlist(auction.id);
  };

  const handleBidConfirm = async () => {
    setShowConfirm(false);
    const amount = parseFloat(bidAmount);
    setBidding(true);
    try {
      await placeBid(auction.id, amount);
      toast.success('Bid placed successfully!', { description: `You bid ₹${amount.toLocaleString()} on ${auction.title}` });
      setBidAmount(String(amount + auction.bidIncrement));
      // Refresh bids immediately after placing
      if (id) refreshBids(id);
    } catch (err) {
      console.error('Bid failed:', err);
      const message = err instanceof ApiError ? err.message : 'Failed to place bid';
      setBidError(message);
      toast.error(message);
    } finally {
      setBidding(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/auctions" className="inline-flex items-center gap-1 text-lg text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <MdOutlineArrowBack className="h-4 w-4" /> Back to Auctions
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Image Gallery + Details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Main Image */}
            <div className="relative rounded-xl overflow-hidden border border-border group shadow-card">
              {auction.images && auction.images.length > 0 ? (
                <img
                  src={auction.images[selectedImageIdx] || auction.images[0]}
                  alt={auction.title}
                  className="w-full aspect-[16/10] object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full aspect-[16/10] bg-muted flex items-center justify-center">
                  <MdOutlineImage className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              {/* Arrow Navigation */}
              {auction.images && auction.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx(i => (i - 1 + auction.images.length) % auction.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <MdOutlineChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx(i => (i + 1) % auction.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <MdOutlineChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-sm text-white font-mono">
                    {selectedImageIdx + 1} / {auction.images.length}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnail Strip */}
            {auction.images && auction.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {auction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={cn(
                      "shrink-0 rounded-xl overflow-hidden border-2 transition-all w-20 h-20",
                      idx === selectedImageIdx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${auction.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={auction.status} />
                <span className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{auction.category}</span>
                <span className="rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{auction.condition}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{auction.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{auction.description}</p>

              {/* Seller */}
              <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MdOutlinePerson className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">{auction.sellerName}</p>
                  <p className="text-base text-muted-foreground flex items-center gap-1"><MdOutlineCheck className="h-3 w-3 text-success" /> Verified Seller</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-5 sticky top-24 shadow-card">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Current Highest Bid</p>
                <p className="font-mono text-4xl font-bold text-primary leading-none">
                  {auction.currentBid > 0 ? `₹${auction.currentBid.toLocaleString()}` : 'No bids yet'}
                </p>
                {auction.currentBid > 0 && (
                  <p className="text-[11px] text-success mt-1.5">+₹{(auction.currentBid - auction.basePrice).toLocaleString()} from base</p>
                )}
              </div>

              <CountdownTimer endTime={auction.endTime} onExpire={handleAuctionExpire} />

              {auction.status !== 'closed' && auction.status !== 'upcoming' && (
                <div className="space-y-2.5">
                  <p className="text-base text-muted-foreground">Min. next bid: <span className="font-mono font-semibold text-foreground">₹{minBid.toLocaleString()}</span></p>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => { setBidAmount(e.target.value); setBidError(''); }}
                    className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    placeholder="Enter bid amount"
                  />
                  {bidError && <p className="text-base text-destructive">{bidError}</p>}
                  <button
                    onClick={handleBidClick}
                    disabled={bidding}
                    className="w-full rounded-xl gradient-gold py-3.5 text-lg font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {bidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-base text-muted-foreground border-t border-border pt-3.5">
                <span className="flex items-center gap-1"><MdOutlineGavel className="h-3.5 w-3.5" /> {auction.totalBids} bids</span>
                <span className="flex items-center gap-1"><MdOutlineFavoriteBorder className="h-3.5 w-3.5" /> {auction.watchlistCount} saved</span>
                <button
                  onClick={handleWatchlistClick}
                  className={cn("flex items-center gap-1 font-medium transition-colors", isWatched ? "text-destructive" : "hover:text-primary")}
                >
                  {isWatched ? <MdOutlineFavorite className="h-3.5 w-3.5" /> : <MdOutlineFavoriteBorder className="h-3.5 w-3.5" />}
                  {isWatched ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Bid History */}
            {auctionBids.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-lg font-semibold mb-3">Bid History</h3>
                <div className="space-y-2">
                  {auctionBids.slice(0, 8).map((bid, i) => (
                    <div key={bid.id} className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-base",
                      i === 0 ? "bg-primary/8 border border-primary/15" : "bg-muted/40"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">#{i + 1}</span>
                        <span className="text-lg font-medium">{bid.bidderName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-semibold">₹{bid.amount.toLocaleString()}</span>
                        <p className="text-sm text-muted-foreground">{new Date(bid.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl font-bold mb-6">Related Auctions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          </div>
        )}
      </div>

      {/* Bid Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            <h3 className="font-display text-xl font-bold">Confirm Your Bid</h3>
            <p className="text-lg text-muted-foreground">
              You are about to place a bid of <span className="font-mono font-semibold text-foreground">₹{parseFloat(bidAmount).toLocaleString()}</span> on <span className="font-semibold text-foreground">{auction.title}</span>.
            </p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-base font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBidConfirm}
                className="flex-1 rounded-xl gradient-gold py-2.5 text-base font-bold text-primary-foreground transition-all hover:scale-[1.02]"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
