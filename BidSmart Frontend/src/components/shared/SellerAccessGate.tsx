import { Link } from 'react-router-dom';
import {
  MdOutlineEmojiEvents as Trophy,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineAnalytics as Analytics,
  MdOutlineStorefront as Storefront,
  MdOutlineSwapHoriz as SwapHoriz,
  MdOutlineArrowForward as ArrowRight,
  MdOutlineVerifiedUser,
  MdOutlineInventory2,
  MdOutlineTrendingUp,
  MdOutlineNotifications,
  MdOutlineCheckCircle,
  MdOutlineInsights,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import heroImg from '@/assets/hero-auction.jpg';

interface SellerAccessGateProps {
  feature: string;
  description: string;
}

const perks = [
  { icon: Trophy, label: 'Track Winners', desc: 'See who won each auction and their final bid amount.' },
  { icon: RupeeSign, label: 'Revenue Snapshot', desc: 'Total earnings and sold vs unsold breakdown at a glance.' },
  { icon: Analytics, label: 'Conversion Metrics', desc: 'Understand which listings convert to successful sales.' },
  { icon: MdOutlineInventory2, label: 'Manage Listings', desc: 'Edit, pause, or delete your auctions from one dashboard.' },
  { icon: MdOutlineTrendingUp, label: 'Bid Activity', desc: 'Monitor incoming bids in real time across all auctions.' },
  { icon: MdOutlineNotifications, label: 'Instant Alerts', desc: 'Get notified the moment someone bids or your auction ends.' },
];

const steps = [
  { icon: MdOutlineVerifiedUser, title: 'Apply as Seller', desc: 'Submit your store details and ID for admin verification.' },
  { icon: MdOutlineCheckCircle, title: 'Get Approved', desc: 'Our team reviews your application within 1–2 business days.' },
  { icon: MdOutlineInventory2, title: 'List Your Items', desc: 'Create auctions with photos, price, and duration.' },
  { icon: MdOutlineInsights, title: 'Track & Earn', desc: 'Monitor bids, close auctions, and collect your revenue.' },
];

const SellerAccessGate = ({ feature, description }: SellerAccessGateProps) => {
  const { currentUser, switchMode } = useApp();
  const isRegisteredSeller = currentUser?.role === 'seller';

  return (
    <div className="min-h-screen animate-fade-in">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex items-center overflow-hidden min-h-screen">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover animate-hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                background: `radial-gradient(circle, hsl(36 60% 52% / ${0.25 + Math.random() * 0.35}), transparent)`,
                animation: `particle-rise ${Math.random() * 10 + 7}s linear ${Math.random() * 5}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="container relative mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-1.5 mb-6 animate-float-up animate-border-glow">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seller Zone · {feature}</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-tight animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
              {isRegisteredSeller ? 'Switch to' : 'Become a'}<br />
              <span className="gradient-text-animated">{isRegisteredSeller ? 'Seller Mode' : 'Seller.'}</span>
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-lg leading-relaxed mb-8 animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
              {isRegisteredSeller
                ? `${description} Switch to your seller mode to continue.`
                : `${description} Register as a seller to get started.`}
            </p>
            <div className="flex flex-wrap gap-3 animate-float-up delay-500" style={{ animationFillMode: 'both' }}>
              {isRegisteredSeller ? (
                <button
                  onClick={switchMode}
                  className="group inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-4 text-lg font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  <SwapHoriz className="h-5 w-5" /> Switch to Seller Mode
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <Link
                  to="/become-seller"
                  className="group inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-4 text-lg font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  <Storefront className="h-5 w-5" /> Register as Seller
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link
                to="/auctions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-lg font-medium text-white transition-all hover:bg-white/10 hover:border-white/30"
              >
                Browse Auctions
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative overflow-hidden bg-card border-y border-border">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border relative z-10">
          {steps.map((s, i) => (
            <div key={s.title} className="group flex items-center gap-4 px-6 py-8 md:py-10 transition-colors hover:bg-primary/[0.02] animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ PERKS ═══════════ */}
      <section className="relative overflow-hidden section-bg-art">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">What You Get as a Seller</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="group rounded-2xl glass-card p-7 hover-lift sparkle-hover animate-float-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 mb-5 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">{p.label}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="container mx-auto px-4 pb-20 pt-4">
        <div className="relative rounded-2xl overflow-hidden border border-primary/15 max-w-4xl mx-auto">
          <div className="absolute inset-0 gradient-gold" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/15" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-white/15 blur-[60px] pointer-events-none" />
          <div className="relative py-12 md:py-14 text-center px-8 flex flex-col items-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">
              {isRegisteredSeller ? 'Ready to Continue?' : 'Start Selling Today'}
            </h2>
            <p className="text-base text-white/75 mb-8 max-w-sm leading-relaxed">
              {isRegisteredSeller
                ? 'Switch to seller mode and manage your auctions right now.'
                : 'Join thousands of sellers reaching premium buyers on BidSmart.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {isRegisteredSeller ? (
                <button
                  onClick={switchMode}
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-amber-800 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  Switch to Seller <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <Link to="/become-seller" className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-amber-800 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
                  Register as Seller <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link to="/auctions" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/15 hover:border-white/60">
                Browse Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerAccessGate;
