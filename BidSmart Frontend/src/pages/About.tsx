import { Link } from 'react-router-dom';
import { MdOutlineSecurity as Shield, MdOutlineCheckCircle as CheckCircle, MdOutlineLock as Lock, MdOutlineBalance as Scale, MdOutlineGroup as Users, MdOutlineVisibility as Eye, MdOutlineBolt as Zap, MdOutlineEmojiEvents as Award, MdOutlineArrowForward as ArrowRight } from 'react-icons/md';
import heroImg from '@/assets/hero-auction.jpg';
import artImg from '@/assets/auction-art.jpg';
import furnitureImg from '@/assets/auction-furniture.jpg';

const About = () => (
  <div className="min-h-screen animate-fade-in">
    {/* Hero with background image */}
    <section className="relative pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="" className="w-full h-full object-cover animate-hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
      </div>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/25"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              bottom: '-5px',
              animation: `particle-rise ${Math.random() * 8 + 5}s linear ${Math.random() * 4}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 text-center py-16 relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 text-white animate-float-up">
          Transparent. Fair. <span className="gradient-text-animated">Intelligent.</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
          BidSmart reimagines the auction experience with cutting-edge technology, verified sellers, and a commitment to fairness.
        </p>
      </div>
    </section>

    {/* How It Works with decorative backgrounds */}
    <section className="relative overflow-hidden bg-floating-orbs">
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="font-display text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '01', icon: Users, title: 'Register', desc: 'Create your free account and choose your role as buyer or seller.' },
            { step: '02', icon: Eye, title: 'Browse', desc: 'Explore curated auctions across 10+ categories of premium items.' },
            { step: '03', icon: Zap, title: 'Bid', desc: 'Place bids in real-time with transparent pricing and fair rules.' },
            { step: '04', icon: Award, title: 'Win', desc: 'Secure your item with verified payment and guaranteed delivery.' },
          ].map((s, i) => (
            <div key={s.step} className="relative text-center group animate-float-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:scale-110 group-hover:bg-primary/15 group-hover:shadow-elegant">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-sm font-mono font-bold text-primary">STEP {s.step}</span>
              <h3 className="font-display text-2xl font-semibold mt-1 mb-2">{s.title}</h3>
              <p className="text-lg text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why BidSmart with background images */}
    <section className="relative bg-card border-y border-border overflow-hidden">
      <div className="absolute -top-20 -right-32 w-[500px] h-[500px] opacity-[0.03] pointer-events-none rotate-6">
        <img src={artImg} alt="" className="w-full h-full object-cover rounded-3xl" />
      </div>
      <div className="absolute -bottom-20 -left-32 w-[400px] h-[400px] opacity-[0.03] pointer-events-none -rotate-6">
        <img src={furnitureImg} alt="" className="w-full h-full object-cover rounded-3xl" />
      </div>
      <div className="absolute inset-0 bg-lines-pattern" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="font-display text-4xl font-bold text-center mb-12">Why Choose BidSmart</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'SSL Secured', desc: 'End-to-end encryption protects every transaction.' },
            { icon: CheckCircle, title: 'Seller Verification', desc: 'Multi-step verification ensures trusted sellers.' },
            { icon: Lock, title: 'Escrow Protection', desc: 'Funds held securely until delivery confirmation.' },
            { icon: Scale, title: 'Fair Bidding', desc: 'Transparent rules prevent last-second manipulation.' },
            { icon: Users, title: 'Community Trust', desc: 'Rated 4.9/5 by our growing community of 8,600+ users.' },
            { icon: Award, title: 'Dispute Resolution', desc: 'Dedicated team to handle any issues promptly.' },
          ].map((f, i) => (
            <div key={f.title} className="rounded-2xl border border-border bg-background/50 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:-translate-y-1 hover:shadow-soft sparkle-hover animate-float-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-lg text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA with image background */}
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <img src={furnitureImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700/90 via-amber-600/85 to-amber-500/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_60%)]" />
        </div>
        <div className="relative py-16 px-8">
          <h2 className="font-display text-4xl font-bold mb-4 text-white">Start Your Auction Journey</h2>
          <p className="text-lg text-white/80 mb-8">Join BidSmart today and discover a smarter way to buy and sell.</p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-amber-800 shadow-elegant hover:scale-105 transition-all">
            Create Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
