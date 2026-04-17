import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdOutlineFavoriteBorder, MdOutlineFavorite, MdOutlineVisibility, MdOutlineGavel, MdOutlinePerson, MdOutlineLocationOn, MdOutlineArrowBack, MdOutlineCheck, MdOutlineImage, MdOutlineChevronLeft, MdOutlineChevronRight, MdOutlineHistory, MdOutlineVerifiedUser } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import CountdownTimer from '@/components/shared/CountdownTimer';
import StatusBadge from '@/components/shared/StatusBadge';
import AuctionCard from '@/components/shared/AuctionCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ApiError, consentApi, ApiConsentStatus, ApiConsent, buyerProfileApi } from '@/lib/apiService';

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
  const [consentStatus, setConsentStatus] = useState<ApiConsentStatus | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentSignName, setConsentSignName] = useState('');
  const [consentAgree, setConsentAgree] = useState(false);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [sellerConsents, setSellerConsents] = useState<ApiConsent[] | null>(null);
  const [buyerStatus, setBuyerStatus] = useState<'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED' | null>(null);

  useEffect(() => {
    if (!currentUser) { setBuyerStatus(null); return; }
    buyerProfileApi.getMine()
      .then(p => setBuyerStatus(p.status))
      .catch(() => setBuyerStatus('NONE'));
  }, [currentUser?.id]);

  const loadConsent = useCallback(async () => {
    if (!id || !currentUser) return;
    try {
      const status = await consentApi.getStatus(id);
      setConsentStatus(status);
    } catch {
      setConsentStatus(null);
    }
  }, [id, currentUser]);

  useEffect(() => { loadConsent(); }, [loadConsent]);

  useEffect(() => {
    if (!auction || !currentUser) return;
    if (auction.sellerId !== currentUser.id) { setSellerConsents(null); return; }
    consentApi.listByAuction(auction.id).then(setSellerConsents).catch(() => setSellerConsents([]));
  }, [auction?.id, currentUser?.id, auction?.sellerId]);

  useEffect(() => {
    if (auction) {
      const min = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.basePrice;
      setBidAmount(String(min));
    }
  }, [auction?.id]);

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
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4 animate-gentle-bounce">
            <MdOutlineImage className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mt-4">Auction not found</h2>
          <p className="text-muted-foreground mt-1 mb-4">This auction may have been removed or doesn't exist.</p>
          <Link to="/auctions" className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors">
            <MdOutlineArrowBack className="h-4 w-4" /> Browse all auctions
          </Link>
        </div>
      </div>
    );
  }

  const isWatched = watchlist.includes(auction.id);
  const minBid = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.basePrice;
  const notStarted = !!auction.startTime && new Date(auction.startTime).getTime() > Date.now();
  const isOwnAuction = !!currentUser && currentUser.id === auction.sellerId;
  const isBuyerVerified = buyerStatus === 'VERIFIED';
  const needsBuyerVerification = !!currentUser && !isOwnAuction && !isBuyerVerified;
  const handleAuctionStart = useCallback(() => {
    refreshAuctions();
    if (id) refreshBids(id);
  }, [refreshAuctions, refreshBids, id]);

  const validateBid = (): boolean => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) { setBidError('Enter a valid amount'); return false; }
    if (amount < minBid) { setBidError(`Minimum bid is ₹${minBid.toLocaleString()}`); return false; }
    if (amount > 999_999_999_999) { setBidError('Maximum bid is ₹999,999,999,999'); return false; }
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
    if (notStarted) {
      toast.error('This auction has not started yet.');
      return;
    }
    if (needsBuyerVerification) {
      toast.error('Please complete buyer verification to participate.');
      navigate('/become-buyer');
      return;
    }
    if (consentStatus?.required && !consentStatus?.signed) {
      toast.error('Please sign the consent form first.');
      setShowConsent(true);
      return;
    }
    if (!validateBid()) return;
    setShowConfirm(true);
  };

  const handleConsentSubmit = async () => {
    if (!auction || !currentUser) return;
    if (needsBuyerVerification) {
      toast.error('Please complete buyer verification first.');
      setShowConsent(false);
      navigate('/become-buyer');
      return;
    }
    if (!consentSignName.trim()) { toast.error('Please type your full name as signature.'); return; }
    if (!consentAgree) { toast.error('Please agree to the rules before signing.'); return; }
    setConsentSubmitting(true);
    try {
      await consentApi.sign(auction.id, consentSignName.trim());
      toast.success('Consent signed. You can now bid on this auction.');
      setShowConsent(false);
      setConsentAgree(false);
      await loadConsent();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to sign consent';
      toast.error(msg);
    } finally {
      setConsentSubmitting(false);
    }
  };

  const handleWatchlistClick = () => {
    if (!currentUser) {
      toast.error('Please log in to save auctions to your watchlist.');
      navigate('/login');
      return;
    }
    if (needsBuyerVerification) {
      toast.error('Please complete buyer verification to use the watchlist.');
      navigate('/become-buyer');
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
    <div className="relative min-h-screen overflow-hidden pt-24 pb-16 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-20" />

      <div className="relative container mx-auto px-4">
        {/* Back link */}
        <Link to="/auctions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <MdOutlineArrowBack className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Auctions
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Image Gallery + Details */}
          <div className="lg:col-span-3 space-y-6 animate-float-up">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="relative rounded-2xl overflow-hidden bg-card group">
                {auction.images && auction.images.length > 0 ? (
                  <img
                    src={auction.images[selectedImageIdx] || auction.images[0]}
                    alt={auction.title}
                    className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full aspect-[16/10] bg-muted flex flex-col items-center justify-center gap-2">
                    <MdOutlineImage className="h-16 w-16 text-muted-foreground/20" />
                    <span className="text-sm text-muted-foreground/40">No images available</span>
                  </div>
                )}
                {/* Arrow Navigation */}
                {auction.images && auction.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIdx(i => (i - 1 + auction.images.length) % auction.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-2.5 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
                    >
                      <MdOutlineChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIdx(i => (i + 1) % auction.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-2.5 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
                    >
                      <MdOutlineChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs text-white font-mono font-medium">
                      {selectedImageIdx + 1} / {auction.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {auction.images && auction.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {auction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={cn(
                      "shrink-0 rounded-xl overflow-hidden border-2 transition-all w-20 h-20 hover:scale-105",
                      idx === selectedImageIdx
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border opacity-50 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${auction.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={auction.status} />
                <span className="rounded-lg bg-muted/80 border border-border/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">{auction.category}</span>
                <span className="rounded-lg bg-muted/80 border border-border/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">{auction.condition}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {auction.title}
              </h1>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed">{auction.description}</p>

              {/* Seller Card */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 shrink-0">
                    <MdOutlinePerson className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate">{auction.sellerName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MdOutlineVerifiedUser className="h-3.5 w-3.5 text-success" /> Verified Seller
                    </p>
                  </div>
                </div>
              </div>

              {/* Bid History — Below details on left side */}
              {auctionBids.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-float-up delay-200">
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                        <MdOutlineHistory className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-semibold">Bid History</h3>
                      <span className="ml-auto text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">{auctionBids.length} bid{auctionBids.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-2">
                      {auctionBids.slice(0, 8).map((bid, i) => (
                        <div key={bid.id} className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors",
                          i === 0
                            ? "bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/15"
                            : i % 2 === 1 ? "bg-muted/30" : ""
                        )}>
                          <div className="flex items-center gap-2.5">
                            <span className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                              i === 0
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {i + 1}
                            </span>
                            <span className="font-medium">{bid.bidderName}</span>
                            {i === 0 && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-1.5 py-0.5">Highest</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={cn("font-mono font-semibold", i === 0 ? "text-primary" : "")}>
                              ₹{bid.amount.toLocaleString()}
                            </span>
                            <p className="text-xs text-muted-foreground">{new Date(bid.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seller-only: signed consents list */}
              {sellerConsents !== null && auction.sellerId === currentUser?.id && (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-float-up delay-200">
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                        <MdOutlineVerifiedUser className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-semibold">Signed Consents</h3>
                      <span className="ml-auto text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">{sellerConsents.length} total</span>
                    </div>
                    {sellerConsents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No buyer has signed consent yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {sellerConsents.map(c => (
                          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate">{c.userName}</span>
                                {c.userVerified && <MdOutlineVerifiedUser className="h-3.5 w-3.5 text-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{c.userEmail}</p>
                              <p className="text-xs text-muted-foreground">
                                Signed {new Date(c.signedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  await consentApi.openDocument(auction.id, c.userId);
                                } catch (e) {
                                  toast.error(e instanceof Error ? e.message : 'Unable to open document');
                                }
                              }}
                              className="shrink-0 text-xs font-semibold text-primary hover:underline"
                            >
                              View →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky Bidding Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Bid Card */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-float-up delay-100">
                {/* Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-2xl" style={{ animation: 'shimmer 4s ease-in-out infinite', backgroundSize: '200% 100%' }} />

                <div className="relative p-5 space-y-5">
                  {/* Top accent */}
                  <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-primary/8 to-transparent rounded-bl-full" />

                  {/* Current Bid */}
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1.5">Current Highest Bid</p>
                    <p className="font-mono text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent leading-none">
                      {auction.currentBid > 0 ? `₹${auction.currentBid.toLocaleString()}` : 'No bids yet'}
                    </p>
                    {auction.currentBid > 0 && (
                      <p className="text-xs text-success font-medium mt-1.5 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        +₹{(auction.currentBid - auction.basePrice).toLocaleString()} from base
                      </p>
                    )}
                  </div>

                  {/* Timer */}
                  {notStarted ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-primary">Starts In</p>
                      <CountdownTimer endTime={auction.startTime} onExpire={handleAuctionStart} />
                      <p className="text-xs text-muted-foreground">
                        Auction opens on{' '}
                        <span className="font-medium text-foreground">
                          {new Date(auction.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <CountdownTimer endTime={auction.endTime} onExpire={handleAuctionExpire} />
                  )}

                  {/* Upcoming banner */}
                  {notStarted && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm font-semibold text-foreground">Bidding hasn't started yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll be able to place a bid once the auction opens.
                      </p>
                    </div>
                  )}

                  {/* Buyer verification gate */}
                  {needsBuyerVerification && (
                    <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Verification required to participate</p>
                      <p className="text-xs text-muted-foreground">
                        {buyerStatus === 'PENDING'
                          ? 'Your buyer verification is pending admin approval. You can bid once approved.'
                          : buyerStatus === 'REJECTED'
                            ? 'Your previous verification was rejected. Please resubmit to bid or save.'
                            : 'Verify your identity to bid, sign consent forms, and save auctions.'}
                      </p>
                      {buyerStatus !== 'PENDING' && (
                        <button
                          onClick={() => navigate('/become-buyer')}
                          className="w-full rounded-xl gradient-gold py-2.5 text-sm font-bold text-primary-foreground shadow-elegant hover:scale-[1.01] transition-all"
                        >
                          {buyerStatus === 'REJECTED' ? 'Resubmit Verification' : 'Verify to Participate'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Consent banner */}
                  {!needsBuyerVerification && consentStatus?.required && !consentStatus?.signed && auction.sellerId !== currentUser?.id && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Consent required before bidding</p>
                      <p className="text-xs text-muted-foreground">
                        {consentStatus.windowOpen
                          ? 'Review the seller\'s rules and sign to participate in this auction.'
                          : 'The consent window is not currently open.'}
                      </p>
                      {(consentStatus.consentStartTime || consentStatus.consentEndTime) && (
                        <div className="rounded-lg bg-background/60 border border-border/40 p-2.5 text-[11px] space-y-1">
                          {consentStatus.consentStartTime && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Opens</span>
                              <span className="font-medium text-foreground">
                                {new Date(consentStatus.consentStartTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                          )}
                          {consentStatus.consentEndTime && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">Closes</span>
                              <span className="font-medium text-foreground">
                                {new Date(consentStatus.consentEndTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {consentStatus.windowOpen && (
                        <button onClick={() => setShowConsent(true)} className="w-full rounded-xl gradient-gold py-2.5 text-sm font-bold text-primary-foreground shadow-elegant hover:scale-[1.01] transition-all">
                          Sign Consent to Participate
                        </button>
                      )}
                    </div>
                  )}
                  {!needsBuyerVerification && consentStatus?.required && consentStatus?.signed && (
                    <div className="rounded-xl border border-success/30 bg-success/5 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheck className="h-4 w-4 text-success" />
                        <p className="text-xs text-muted-foreground">Consent signed — you're cleared to bid.</p>
                      </div>
                      {consentStatus.consent && (
                        <button
                          onClick={async () => {
                            try {
                              await consentApi.openDocument(auction.id, consentStatus.consent!.userId);
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : 'Unable to open document');
                            }
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View consent document →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bid Input */}
                  {auction.status !== 'closed' && auction.status !== 'upcoming' && !notStarted && !needsBuyerVerification && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Min. next bid: <span className="font-mono font-semibold text-foreground">₹{minBid.toLocaleString()}</span>
                      </p>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">₹</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={e => { setBidAmount(e.target.value); setBidError(''); }}
                          className="w-full rounded-xl border border-border bg-muted/60 pl-8 pr-4 py-3 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                          placeholder="Enter bid amount"
                        />
                      </div>
                      {bidError && (
                        <p className="text-sm text-destructive font-medium animate-fade-in">{bidError}</p>
                      )}
                      <button
                        onClick={handleBidClick}
                        disabled={bidding || (consentStatus?.required && !consentStatus?.signed)}
                        className="w-full rounded-xl gradient-gold py-3.5 text-base font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {bidding ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Placing Bid...
                          </span>
                        ) : 'Place Bid'}
                      </button>
                    </div>
                  )}

                  {/* Auction ended message */}
                  {auction.status === 'closed' && (
                    <div className="rounded-xl bg-muted/60 border border-border p-4 text-center">
                      <p className="text-sm font-semibold text-muted-foreground">This auction has ended</p>
                      {auctionBids.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Won by <span className="font-semibold text-foreground">{auctionBids[0].bidderName}</span> for <span className="font-mono font-semibold text-primary">₹{auctionBids[0].amount.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                    <span className="flex items-center gap-1.5">
                      <MdOutlineGavel className="h-4 w-4" />
                      <span className="font-mono font-medium">{auction.totalBids}</span> bids
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MdOutlineFavoriteBorder className="h-4 w-4" />
                      <span className="font-mono font-medium">{auction.watchlistCount}</span> saved
                    </span>
                    <button
                      onClick={handleWatchlistClick}
                      className={cn(
                        "flex items-center gap-1.5 font-medium transition-all px-3 py-1.5 rounded-lg",
                        isWatched
                          ? "text-destructive bg-destructive/5 hover:bg-destructive/10"
                          : "hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {isWatched ? <MdOutlineFavorite className="h-4 w-4" /> : <MdOutlineFavoriteBorder className="h-4 w-4" />}
                      {isWatched ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 animate-float-up delay-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                <MdOutlineGavel className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Related Auctions</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          </div>
        )}
      </div>

      {/* Bid Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                <MdOutlineGavel className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold">Confirm Your Bid</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You are about to place a bid of <span className="font-mono font-semibold text-primary">₹{parseFloat(bidAmount).toLocaleString()}</span> on <span className="font-semibold text-foreground">{auction.title}</span>.
            </p>
            <div className="rounded-xl bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">This action cannot be undone. You will be notified if you are outbid.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBidConfirm}
                className="flex-1 rounded-xl gradient-gold py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-sm"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Form Dialog */}
      {showConsent && consentStatus?.required && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 max-w-lg w-full mx-4 my-8 shadow-xl space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                <MdOutlineVerifiedUser className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Auction Consent Form</h3>
                <p className="text-xs text-muted-foreground">{auction.title}</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Buyer ID</span><span className="font-mono">{currentUser?.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{currentUser?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{currentUser?.email}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-success font-semibold"><MdOutlineCheck className="h-3 w-3" /> Verified</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rules &amp; Regulations</p>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                {consentStatus.rulesAndRegulations || 'No rules provided.'}
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={consentAgree} onChange={e => setConsentAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span className="text-muted-foreground">I have read and agree to the rules and regulations set by the seller.</span>
            </label>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signature (type full name)</p>
              <input type="text" value={consentSignName} onChange={e => setConsentSignName(e.target.value)} placeholder="Type your full legal name"
                className="w-full rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowConsent(false)} disabled={consentSubmitting}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleConsentSubmit} disabled={consentSubmitting}
                className="flex-1 rounded-xl gradient-gold py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-sm disabled:opacity-70 disabled:hover:scale-100">
                {consentSubmitting ? 'Signing...' : 'Sign & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
