import { Link } from 'react-router-dom';
import {
  MdOutlineEmojiEvents as Trophy,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineAnalytics as Analytics,
  MdOutlineStorefront as Storefront,
  MdOutlineSwapHoriz as SwapHoriz,
  MdOutlineArrowForward as ArrowRight,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import heroImg from '@/assets/hero-auction.jpg';

interface SellerAccessGateProps {
  feature: string;
  description: string;
}

const defaultPerks = [
  { icon: Trophy, label: 'Track winners', desc: 'See who won each auction and their final bid.' },
  { icon: RupeeSign, label: 'Revenue snapshot', desc: 'Total earnings and sold vs unsold breakdown.' },
  { icon: Analytics, label: 'Conversion metrics', desc: 'Understand which listings convert to sales.' },
];

const SellerAccessGate = ({ feature, description }: SellerAccessGateProps) => {
  const { currentUser, switchMode } = useApp();
  const isRegisteredSeller = currentUser?.role === 'seller';

  return (
    <div className="min-h-screen animate-fade-in">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/20" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <div className="container relative mx-auto px-4 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2 mb-6 animate-float-up animate-border-glow">
            <Storefront className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seller Zone · {feature}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-white mb-4 tracking-tight animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
            {isRegisteredSeller ? 'Switch to ' : 'Become a '}
            <span className="gradient-text-animated">{isRegisteredSeller ? 'Seller Mode' : 'Seller'}</span>
          </h1>
          <p className="text-lg text-white/65 max-w-lg mx-auto leading-relaxed mb-8 animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
            {isRegisteredSeller
              ? `${description} Switch to your seller mode to continue.`
              : `${description} Register as a seller to get started.`}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════ PERKS ═══════════ */}
      <section className="relative overflow-hidden section-bg-art">
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto mb-12">
            {defaultPerks.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="group rounded-2xl glass-card p-6 text-center hover-lift sparkle-hover animate-float-up"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <p className="font-display font-bold text-foreground mb-1">{p.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 justify-center animate-float-up delay-500" style={{ animationFillMode: 'both' }}>
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
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerAccessGate;
