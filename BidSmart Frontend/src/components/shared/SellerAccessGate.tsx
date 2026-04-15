import { Link } from 'react-router-dom';
import {
  MdOutlineEmojiEvents as Trophy,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineAnalytics as Analytics,
  MdOutlineStorefront as Storefront,
  MdOutlineSwapHoriz as SwapHoriz,
  MdOutlineArrowBack as ArrowLeft,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

interface SellerAccessGateProps {
  /** Short name of the gated feature, e.g. "Seller Dashboard" */
  feature: string;
  /** One-line explanation of what this feature gives a seller */
  description: string;
}

const defaultPerks = [
  { icon: Trophy, label: 'Track winners', desc: 'See who won each auction and their final bid.' },
  { icon: RupeeSign, label: 'Revenue snapshot', desc: 'Total earnings and sold vs unsold breakdown.' },
  { icon: Analytics, label: 'Conversion metrics', desc: 'Understand which listings convert to sales.' },
];

const SellerAccessGate = ({ feature, description }: SellerAccessGateProps) => {
  const { currentUser, switchMode } = useApp();

  // Only a user whose registered profile role is 'seller' can toggle modes.
  // Buyers (and guests) must complete seller registration first.
  const isRegisteredSeller = currentUser?.role === 'seller';

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-16 flex items-center justify-center animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />
      <div className="pointer-events-none absolute top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative container mx-auto px-4 max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/20 to-border shadow-card">
          <div className="relative rounded-3xl bg-card/90 backdrop-blur-sm p-8 md:p-10 text-center">
            {/* Glowing icon */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 shadow-lg">
                <Storefront className="h-10 w-10 text-primary" />
              </div>
            </div>

            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Seller Zone · {feature}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {isRegisteredSeller ? 'Seller Access Required' : 'Become a Seller First'}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
              {isRegisteredSeller
                ? `${description} Switch to your seller mode to continue.`
                : `${description} Register as a seller — add your store details, verify your identity, and set up payouts — to get started.`}
            </p>

            {/* Perk grid */}
            <div className="grid gap-3 sm:grid-cols-3 mb-8 text-left">
              {defaultPerks.map(p => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.label}
                    className="rounded-xl border border-border bg-background/40 p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isRegisteredSeller ? (
                <Button onClick={switchMode} size="lg" className="gap-2">
                  <SwapHoriz className="h-4 w-4" /> Switch to Seller Mode
                </Button>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/become-seller">
                    <Storefront className="h-4 w-4" /> Register as Seller
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAccessGate;
