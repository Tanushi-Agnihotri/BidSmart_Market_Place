import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineArrowForward, MdOutlineGavel, MdOutlineTrendingUp, MdOutlineGroup, MdOutlineStar, MdOutlineStarOutline, MdOutlineSecurity, MdOutlineVisibility, MdOutlineBolt, MdOutlineEmojiEvents, MdOutlineAccessTime, MdOutlineFormatQuote, MdOutlinePerson } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import AuctionCard from '@/components/shared/AuctionCard';
import { mockTestimonials, categories } from '@/data/mockData';
import { auctionApi, statsApi, type ApiPublicStats } from '@/lib/apiService';
import heroImg from '@/assets/hero-auction.jpg';
import artImg from '@/assets/auction-art.jpg';
import jewelryImg from '@/assets/auction-jewelry.jpg';
import watchImg from '@/assets/auction-watch.jpg';
import furnitureImg from '@/assets/auction-furniture.jpg';
import fashionImg from '@/assets/auction-fashion.jpg';
import electronicsImg from '@/assets/auction-electronics.jpg';
import wineImg from '@/assets/auction-wine.jpg';
import vehicleImg from '@/assets/auction-vehicle.jpg';

const Landing = () => {
  const { auctions } = useApp();
  const featured = auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').slice(0, 6);

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<ApiPublicStats | null>(null);

  useEffect(() => {
    auctionApi.getCategoryCounts()
      .then(setCategoryCounts)
      .catch(() => {});
    statsApi.getPublic()
      .then(setStats)
      .catch(() => {});
  }, []);

  const galleryImages = [watchImg, artImg, jewelryImg, furnitureImg, fashionImg, electronicsImg, wineImg, vehicleImg];

  return (
    <div className="animate-fade-in">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury auction" className="h-full w-full object-cover animate-hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
        {/* Particles */}
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

        <div className="container relative mx-auto px-4 py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2 mb-8 animate-float-up animate-border-glow">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Premium Auction Platform</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.05] text-white mb-6 tracking-tight animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
              Bid Smarter.<br />
              <span className="gradient-text-animated">Win Faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/65 mb-10 max-w-lg leading-relaxed animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
              Discover extraordinary items from verified sellers worldwide. Transparent bidding, real-time auctions, and a curated marketplace.
            </p>
            <div className="flex flex-wrap gap-3 animate-float-up delay-500" style={{ animationFillMode: 'both' }}>
              <Link to="/auctions" className="group inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-4 text-lg font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg">
                Explore Auctions <MdOutlineArrowForward className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-lg font-medium text-white transition-all hover:bg-white/10 hover:border-white/30">
                How It Works
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="relative overflow-hidden bg-card border-y border-border">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border relative z-10">
          {[
            { value: (stats?.totalAuctions ?? 0).toLocaleString(), label: 'Auctions', icon: MdOutlineGavel },
            { value: (stats?.totalBids ?? 0).toLocaleString(), label: 'Total Bids', icon: MdOutlineTrendingUp },
            { value: (stats?.activeUsers ?? 0).toLocaleString(), label: 'Active Users', icon: MdOutlineGroup },
            { value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, label: 'Revenue', icon: MdOutlineStar },
          ].map((s, i) => (
            <div key={s.label} className="group flex items-center gap-4 px-6 py-8 md:py-10 transition-colors hover:bg-primary/[0.02] animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <p className="font-mono text-2xl md:text-3xl font-bold tracking-tight leading-none stat-number">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1.5 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="relative overflow-hidden section-bg-art">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 heading-decorated">Browse Categories</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mt-6">From luxury timepieces to rare collectibles, find what inspires you.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/auctions?category=${encodeURIComponent(cat.name)}`}
                className="group rounded-2xl border border-border glass-card p-6 text-center hover-lift sparkle-hover animate-float-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-elegant group-hover:rotate-3">
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{categoryCounts[cat.name] ?? 0} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ IMAGE GALLERY STRIP ═══════════ */}
      <section className="relative overflow-hidden py-5 bg-card/50 border-y border-border">
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--background))_0%,transparent_8%,transparent_92%,hsl(var(--background))_100%)]" />
        <div className="flex gap-4 animate-[scroll_35s_linear_infinite] w-max">
          {[...galleryImages, ...galleryImages].map((img, i) => (
            <div key={i} className="shrink-0 w-52 h-36 rounded-xl overflow-hidden opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-105">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURED AUCTIONS ═══════════ */}
      <section className="relative overflow-hidden bg-floating-orbs">
        <div className="absolute inset-0 bg-lines-pattern" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Featured Auctions</h2>
              <p className="text-lg text-muted-foreground mt-2">Handpicked selections ending soon</p>
            </div>
            <Link to="/auctions" className="group hidden md:inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-base font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-elegant">
              View All <MdOutlineArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(a => <AuctionCard key={a.id} auction={a} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative overflow-hidden bg-card border-y border-border">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto mt-6">Start bidding in four simple steps</p>
          </div>
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[60%] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: MdOutlineGroup, title: 'Register', desc: 'Create your free account in seconds' },
              { step: '02', icon: MdOutlineVisibility, title: 'Browse', desc: 'Explore curated auctions across categories' },
              { step: '03', icon: MdOutlineGavel, title: 'Bid', desc: 'Place your bid with confidence' },
              { step: '04', icon: MdOutlineEmojiEvents, title: 'Win', desc: 'Secure your item and celebrate' },
            ].map((s, i) => (
              <div key={s.step} className="text-center group animate-float-up" style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl glass-card transition-all duration-300 group-hover:shadow-elegant group-hover:scale-105 relative">
                  <s.icon className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full gradient-gold text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                    {s.step}
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold mt-1 mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY BIDSMART ═══════════ */}
      <section className="relative overflow-hidden section-bg-art">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">Why BidSmart?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: MdOutlineSecurity, title: 'Verified Sellers', desc: 'Every seller is vetted and verified for your peace of mind.' },
              { icon: MdOutlineBolt, title: 'Real-Time Bidding', desc: 'Live updates and instant notifications keep you in the action.' },
              { icon: MdOutlineAccessTime, title: 'Timed Auctions', desc: 'Transparent countdowns with fair ending rules.' },
              { icon: MdOutlineVisibility, title: 'Watchlist', desc: 'Save your favourites and get notified before they end.' },
              { icon: MdOutlineEmojiEvents, title: 'Premium Items', desc: 'Curated selection of extraordinary items from around the world.' },
              { icon: MdOutlineTrendingUp, title: 'Smart Analytics', desc: 'Track your bidding history and win rates with insights.' },
            ].map((f, i) => (
              <div key={f.title} className="group rounded-2xl glass-card p-7 hover-lift sparkle-hover animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 mb-5 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                  <f.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">What Our Users Say</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">Trusted by collectors, dealers, and first-time bidders alike.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mockTestimonials.map((t, i) => (
              <div key={t.id} className="group rounded-2xl bg-card border border-border p-7 shadow-lg hover-lift animate-float-up relative overflow-hidden" style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}>
                {/* Gold top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />
                {/* Large faded quote watermark */}
                <MdOutlineFormatQuote className="absolute -top-1 -right-1 h-20 w-20 text-primary/[0.06] rotate-180 pointer-events-none" />

                {/* User info at top */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/25">
                    <MdOutlinePerson className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    idx < t.rating
                      ? <MdOutlineStar key={idx} className="h-4.5 w-4.5 text-primary" />
                      : <MdOutlineStarOutline key={idx} className="h-4.5 w-4.5 text-muted-foreground/30" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[15px] text-foreground/85 leading-relaxed">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="container mx-auto px-4 pb-20 pt-8">
        <div className="relative rounded-2xl overflow-hidden border border-primary/15 max-w-4xl mx-auto">
          {/* Gradient bg */}
          <div className="absolute inset-0 gradient-gold" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/15" />
          {/* Soft glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-white/15 blur-[60px] pointer-events-none" />

          <div className="relative py-12 md:py-14 text-center px-8 flex flex-col items-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">
              Ready to Start Bidding?
            </h2>
            <p className="text-base text-white/75 mb-8 max-w-sm leading-relaxed">Join thousands of collectors on the smartest auction platform.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-amber-800 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
                Get Started <MdOutlineArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
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

export default Landing;
