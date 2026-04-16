import { Link } from 'react-router-dom';
import {
  MdOutlineCookie,
  MdOutlineArrowBack,
  MdOutlineShield,
  MdOutlineTune,
  MdOutlineAnalytics,
  MdOutlineDescription,
  MdOutlineLock,
  MdOutlineArrowForward,
} from 'react-icons/md';

const LAST_UPDATED = 'April 15, 2026';

const cookieTypes = [
  {
    name: 'Essential',
    required: true,
    icon: MdOutlineShield,
    accent: 'from-destructive/30 to-destructive/5',
    iconBg: 'bg-destructive/10 text-destructive',
    desc: 'Required for the site to function — sign-in sessions, security tokens, and cart state. Without these, you cannot place bids or manage your account.',
  },
  {
    name: 'Preferences',
    required: false,
    icon: MdOutlineTune,
    accent: 'from-primary/30 to-primary/5',
    iconBg: 'bg-primary/10 text-primary',
    desc: 'Remember choices you make such as theme (light/dark), language, and sort order on the auctions list.',
  },
  {
    name: 'Analytics',
    required: false,
    icon: MdOutlineAnalytics,
    accent: 'from-sky-400/30 to-sky-400/5',
    iconBg: 'bg-sky-400/10 text-sky-500',
    desc: 'Aggregated, anonymized usage data that helps us understand which features are used and where users get stuck. No personal identifiers are stored in analytics cookies.',
  },
];

const sections = [
  {
    title: 'What Are Cookies',
    body: 'Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences between pages and across visits. BidSmart also uses similar technologies such as localStorage and sessionStorage for the same purposes.',
  },
  {
    title: 'Why We Use Them',
    body: 'Cookies keep you signed in, remember your theme and language preferences, secure your session against tampering, and help us understand how the platform is used so we can improve it.',
  },
  {
    title: 'Managing Cookies',
    body: 'Most browsers let you block or delete cookies through their settings. Blocking essential cookies will prevent you from signing in or placing bids. You can clear preferences and analytics cookies at any time without losing access to the platform.',
  },
  {
    title: 'Third-Party Cookies',
    body: 'When you sign in with Google, Google may set its own cookies. Our payment and shipping partners may set cookies on their checkout pages. Those cookies are governed by their respective privacy policies.',
  },
  {
    title: 'Changes',
    body: 'We may update this Cookie Policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision.',
  },
];

const Cookies = () => (
  <div className="min-h-screen animate-fade-in">
    {/* ═══════════ HERO ═══════════ */}
    <section className="relative overflow-hidden bg-card border-b border-border">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="container mx-auto px-4 pt-28 pb-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2 mb-6 animate-float-up animate-border-glow">
          <MdOutlineCookie className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
          Cookie <span className="gradient-gold-text">Policy</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-5 animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
          How BidSmart uses cookies and similar technologies to improve your experience.
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Last updated {LAST_UPDATED}
        </div>
      </div>
    </section>

    <div className="relative overflow-hidden pb-20">
    <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
    <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

    <div className="relative container mx-auto px-4 max-w-6xl pt-10">

      {/* Intro */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-border mb-10 shadow-card max-w-3xl mx-auto">
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-6 md:p-7">
          <p className="text-lg text-muted-foreground leading-relaxed">
            This Cookie Policy explains how <span className="text-foreground font-semibold">BidSmart</span> uses cookies and similar technologies, what choices you have, and how to change your preferences.
          </p>
        </div>
      </div>

      {/* Cookie types */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground px-2">
            Cookies We Use
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cookieTypes.map(c => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all`}
              >
                <div className={`absolute inset-x-0 -top-px h-px bg-gradient-to-r ${c.accent}`} />

                <div className="relative">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.required ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                      {c.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground px-2">
          Details
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section, idx) => (
          <section
            key={section.title}
            className="group relative rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 font-display font-bold text-primary">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Cross-links */}
      <div className="relative mt-10 overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/20 to-primary/5 max-w-3xl mx-auto">
        <div className="relative rounded-2xl bg-card/90 backdrop-blur-sm p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">Related policies</p>
          <p className="text-base text-muted-foreground mb-5">
            Understand the full picture of how BidSmart handles your data and agreements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/terms"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <MdOutlineDescription className="h-4 w-4 text-primary" />
              Terms of Service
              <MdOutlineArrowForward className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
            <Link
              to="/privacy"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <MdOutlineLock className="h-4 w-4 text-primary" />
              Privacy Policy
              <MdOutlineArrowForward className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
);

export default Cookies;
