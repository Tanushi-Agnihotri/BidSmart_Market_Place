import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdOutlineEmojiEvents as Trophy, MdOutlineCelebration as PartyPopper, MdOutlineArrowForward as ArrowRight, MdOutlineShare as Share2, MdOutlineDownload as Download } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  'hsl(42 50% 54%)',    // gold
  'hsl(40 60% 70%)',    // gold-light
  'hsl(217 89% 60%)',   // accent-blue
  'hsl(0 60% 95%)',     // blush
  'hsl(160 84% 39%)',   // success
  'hsl(38 92% 50%)',    // warning
];

const WinnerDeclaration = () => {
  const { id } = useParams<{ id: string }>();
  const { auctions, bids, currentUser } = useApp();
  const [showConfetti, setShowConfetti] = useState(true);

  const auction = auctions.find(a => a.id === id);
  const winningBid = bids
    .filter(b => b.auctionId === id)
    .sort((a, b) => b.amount - a.amount)[0];

  const confettiPieces = useMemo<ConfettiPiece[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    })), []
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!auction || !winningBid) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Auction Not Found</h2>
          <p className="text-muted-foreground text-base mb-4">This auction doesn't exist or hasn't ended yet.</p>
          <Link to="/auctions">
            <Button variant="outline">Browse Auctions</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isWinner = currentUser?.id === winningBid.bidderId;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map(p => (
            <div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: '2px',
                transform: `rotate(${p.rotation}deg)`,
                animation: `confetti ${p.duration}s ease-in ${p.delay}s forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* Trophy hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative mx-auto w-fit mb-6">
            <div className="rounded-full bg-primary/10 p-6 animate-pulse-glow">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <PartyPopper className="absolute -top-2 -right-2 h-8 w-8 text-warning" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            {isWinner ? (
              <span className="gradient-gold-text">Congratulations!</span>
            ) : (
              <span>Auction Winner</span>
            )}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isWinner
              ? 'You won this auction! Here are the details of your winning bid.'
              : 'This auction has been won. See the results below.'}
          </p>
        </div>

        {/* Winner card */}
        <Card className="mb-6 border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Auction image */}
              <div className="w-full md:w-40 h-40 md:h-auto rounded-xl overflow-hidden shrink-0">
                <img
                  src={auction.images[0]}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{auction.category}</p>
                  <h2 className="font-display text-2xl font-bold">{auction.title}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-sm text-muted-foreground mb-0.5">Winning Bid</p>
                    <p className="font-mono text-xl font-bold text-primary">
                      ₹{winningBid.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-sm text-muted-foreground mb-0.5">Total Bids</p>
                    <p className="font-mono text-xl font-bold">{auction.totalBids}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-sm text-muted-foreground mb-0.5">Winner</p>
                    <p className="text-base font-semibold">{winningBid.bidderName}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-sm text-muted-foreground mb-0.5">Won At</p>
                    <p className="text-base font-semibold">
                      {new Date(winningBid.timestamp).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {isWinner ? (
            <>
              <Button className="flex-1 gradient-gold text-primary-foreground font-bold gap-1.5" onClick={() => toast.success('Payment flow coming soon!')}>
                Proceed to Payment <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={() => toast.success('Receipt downloaded!')}>
                <Download className="h-4 w-4" /> Download Receipt
              </Button>
            </>
          ) : (
            <>
              <Link to="/auctions" className="flex-1">
                <Button className="w-full gradient-gold text-primary-foreground font-bold gap-1.5">
                  Browse More Auctions <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                <Share2 className="h-4 w-4" /> Share Result
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerDeclaration;
