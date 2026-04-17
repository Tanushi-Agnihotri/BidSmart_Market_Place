import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MdOutlineSecurity as Shield, MdOutlineCheckCircle as CheckCircle, MdOutlineLock as Lock,
  MdOutlineBalance as Scale, MdOutlineGroup as Users, MdOutlineVisibility as Eye,
  MdOutlineBolt as Zap, MdOutlineEmojiEvents as Award, MdOutlineArrowForward as ArrowRight,
  MdOutlineGavel, MdOutlineTrendingUp, MdOutlineStar,
} from 'react-icons/md';
import { statsApi, type ApiPublicStats } from '@/lib/apiService';
import heroImg from '@/assets/hero-auction.jpg';
import artImg from '@/assets/auction-art.jpg';
import jewelryImg from '@/assets/auction-jewelry.jpg';
import watchImg from '@/assets/auction-watch.jpg';
import furnitureImg from '@/assets/auction-furniture.jpg';
import fashionImg from '@/assets/auction-fashion.jpg';
import electronicsImg from '@/assets/auction-electronics.jpg';

const About = () => {
  const [stats, setStats] = useState<ApiPublicStats | null>(null);

  useEffect(() => {
    statsApi.getPublic().then(setStats).catch(() => {});
  }, []);

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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">About BidSmart</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-tight animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
            Transparent. Fair.<br />
            <span className="gradient-text-animated">Intelligent.</span>
          </h1>
          <p className="text-base md:text-lg text-white/65 max-w-lg leading-relaxed animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
            BidSmart reimagines the auction experience with cutting-edge technology, verified sellers, and a commitment to fairness.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* ═══════════ STATS BAR ═══════════ */}
    <section className="relative overflow-hidden bg-card border-y border-border">
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border relative z-10">
        {[
          { value: (stats?.totalAuctions ?? 0).toLocaleString(), label: 'Auctions', icon: MdOutlineGavel },
          { value: (stats?.totalBids ?? 0).toLocaleString(), label: 'Total Bids', icon: MdOutlineTrendingUp },
          { value: (stats?.activeUsers ?? 0).toLocaleString(), label: 'Active Users', icon: Users },
          { value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, label: 'Revenue', icon: MdOutlineStar },
        ].map((s, i) => (
          <div key={s.label} className="group flex items-center gap-4 px-6 py-8 md:py-10 transition-colors hover:bg-primary/[0.02] animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 group-hover:shadow-elegant icon-ring">
              <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <div>
              <p className="font-mono text-2xl md:text-3xl font-bold tracking-tight leading-none">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ═══════════ IMAGE GALLERY STRIP ═══════════ */}
    <section className="relative overflow-hidden py-5 bg-card/50 border-b border-border">
      <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--background))_0%,transparent_8%,transparent_92%,hsl(var(--background))_100%)]" />
      <div className="flex gap-4 animate-[scroll_35s_linear_infinite] w-max">
        {[watchImg, artImg, jewelryImg, furnitureImg, fashionImg, electronicsImg, watchImg, artImg, jewelryImg, furnitureImg, fashionImg, electronicsImg].map((img, i) => (
          <div key={i} className="shrink-0 w-52 h-36 rounded-xl overflow-hidden opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-105">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>

    {/* ═══════════ HOW IT WORKS ═══════════ */}
    <section className="relative overflow-hidden bg-card border-b border-border">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mt-6">Start bidding in four simple steps</p>
        </div>
        <div className="hidden lg:block absolute top-[60%] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '01', icon: Users, title: 'Register', desc: 'Create your free account in seconds' },
            { step: '02', icon: Eye, title: 'Browse', desc: 'Explore curated auctions across categories' },
            { step: '03', icon: Zap, title: 'Bid', desc: 'Place your bid with confidence' },
            { step: '04', icon: Award, title: 'Win', desc: 'Secure your item and celebrate' },
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
          <h2 className="font-display text-4xl md:text-5xl font-bold heading-decorated">Why Choose BidSmart?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'SSL Secured', desc: 'End-to-end encryption protects every transaction.' },
            { icon: CheckCircle, title: 'Seller Verification', desc: 'Multi-step verification ensures trusted sellers.' },
            { icon: Lock, title: 'Escrow Protection', desc: 'Funds held securely until delivery confirmation.' },
            { icon: Scale, title: 'Fair Bidding', desc: 'Transparent rules prevent last-second manipulation.' },
            { icon: Users, title: 'Community Trust', desc: 'Rated 4.9/5 by our growing community of 8,600+ users.' },
            { icon: Award, title: 'Dispute Resolution', desc: 'Dedicated team to handle any issues promptly.' },
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

    {/* ═══════════ CTA ═══════════ */}
    <section className="container mx-auto px-4 pb-20 pt-20">
      <div className="relative rounded-2xl overflow-hidden border border-primary/15 max-w-4xl mx-auto">
        <div className="absolute inset-0 gradient-gold" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/15" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-white/15 blur-[60px] pointer-events-none" />
        <div className="relative py-12 md:py-14 text-center px-8 flex flex-col items-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">
            Ready to Start Bidding?
          </h2>
          <p className="text-base text-white/75 mb-8 max-w-sm leading-relaxed">Join thousands of collectors on the smartest auction platform.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-bold text-amber-800 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
              Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

export default About;
