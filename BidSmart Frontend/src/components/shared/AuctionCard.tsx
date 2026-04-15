import { MdOutlineFavorite, MdOutlineFavoriteBorder, MdOutlineGavel, MdOutlineImage } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import CountdownTimer from './CountdownTimer';
import StatusBadge from './StatusBadge';
import type { Auction } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AuctionCard = ({ auction }: { auction: Auction }) => {
  const { watchlist, toggleWatchlist, currentUser } = useApp();
  const navigate = useNavigate();
  const isWatched = watchlist.includes(auction.id);
  const hasImage = auction.images && auction.images.length > 0 && auction.images[0];

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in to save auctions to your watchlist.');
      navigate('/login');
      return;
    }
    toggleWatchlist(auction.id);
  };

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group block rounded-2xl glass-card overflow-hidden hover-lift sparkle-hover transition-all duration-400"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <MdOutlineImage className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={auction.status} />
        </div>
        {/* Watchlist button */}
        <button
          onClick={handleWatchlistClick}
          className={cn(
            "absolute top-3 right-3 rounded-full p-2.5 transition-all duration-300 backdrop-blur-md",
            isWatched
              ? "bg-destructive/90 text-white shadow-lg scale-110"
              : "bg-black/30 text-white/80 hover:bg-black/50 hover:scale-110"
          )}
        >
          {isWatched ? <MdOutlineFavorite className="h-4 w-4" /> : <MdOutlineFavoriteBorder className="h-4 w-4" />}
        </button>
        {/* Category tag */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md">{auction.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {auction.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">by {auction.sellerName}</p>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-semibold">Base</p>
            <p className="font-mono text-base text-muted-foreground">{'\u20B9'}{auction.basePrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-0.5 font-semibold">Current Bid</p>
            <p className="font-mono text-xl font-bold text-primary leading-none">
              {auction.currentBid > 0 ? `\u20B9${auction.currentBid.toLocaleString()}` : '\u2014'}
            </p>
          </div>
        </div>

        {auction.status !== 'closed' && auction.status !== 'upcoming' && (
          <CountdownTimer endTime={auction.endTime} compact />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium"><MdOutlineGavel className="h-3.5 w-3.5" />{auction.totalBids} bids</span>
          <span className="rounded-lg bg-primary/10 px-3.5 py-1.5 text-sm font-bold text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-elegant group-hover:scale-105">
            Bid Now
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
