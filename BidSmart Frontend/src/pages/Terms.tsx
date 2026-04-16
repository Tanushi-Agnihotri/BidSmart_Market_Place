import { Link } from 'react-router-dom';
import {
  MdOutlineDescription,
  MdOutlineArrowBack,
  MdOutlineLock,
  MdOutlineCookie,
  MdOutlineArrowForward,
} from 'react-icons/md';

const LAST_UPDATED = 'April 15, 2026';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using BidSmart, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform. We may update these terms from time to time, and continued use after changes constitutes acceptance of the updated terms.',
  },
  {
    title: 'Eligibility & Accounts',
    body: 'You must be at least 18 years old to register. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Provide accurate, current, and complete information during registration. One person may not maintain multiple active accounts without our written consent.',
  },
  {
    title: 'Bidding Rules',
    body: 'All bids placed on BidSmart are binding. Once submitted, a bid cannot be retracted. The highest valid bid at the close of an auction wins the item, subject to the seller\u2019s reserve price (if any). You may not bid on your own auctions, collude with other bidders, or use automated bidding tools without authorization. We reserve the right to cancel bids that violate these rules.',
  },
  {
    title: 'Seller Obligations',
    body: 'Sellers must accurately describe items, disclose defects, and ship won items within 7 business days of auction close. Prohibited items include counterfeits, stolen goods, hazardous materials, and anything unlawful under Indian law. BidSmart may remove listings and suspend accounts that violate these rules.',
  },
  {
    title: 'Payments & Fees',
    body: 'Winning bidders must complete payment within 48 hours of auction close. BidSmart charges sellers a commission on successful sales (current rates shown on the seller dashboard). Payment processing is handled by third-party providers; their terms apply to the transaction.',
  },
  {
    title: 'Prohibited Conduct',
    body: 'You may not use BidSmart to harass other users, manipulate auction outcomes, reverse-engineer the platform, post misleading content, or circumvent security measures. Violations may result in bid cancellations, account suspension, and legal action.',
  },
  {
    title: 'Limitation of Liability',
    body: 'BidSmart provides the platform "as is." We are not a party to transactions between buyers and sellers and are not liable for item condition, delivery failures, or disputes between users. Our total liability to you is limited to the fees you have paid to BidSmart in the six months preceding the claim.',
  },
  {
    title: 'Termination',
    body: 'We may suspend or terminate your account at any time for violations of these terms. You may close your account at any time, subject to completion of any active auctions or pending payments.',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms can be sent via our Contact page. We typically respond within 2 business days.',
  },
];

const Terms = () => (
  <div className="min-h-screen animate-fade-in">
    {/* ═══════════ HERO ═══════════ */}
    <section className="relative overflow-hidden bg-card border-b border-border">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="container mx-auto px-4 pt-28 pb-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2 mb-6 animate-float-up animate-border-glow">
          <MdOutlineDescription className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
          Terms of <span className="gradient-gold-text">Service</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-5 animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
          Please read these terms carefully before using the BidSmart platform.
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Last updated {LAST_UPDATED}
        </div>
      </div>
    </section>

    <div className="relative overflow-hidden pb-20">
    <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

    <div className="relative container mx-auto px-4 max-w-6xl pt-10">

      <div className="relative rounded-2xl border border-border bg-card mb-10 shadow-card max-w-3xl mx-auto">
        <div className="p-6 md:p-7">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to <span className="text-foreground font-semibold">BidSmart</span>. These Terms of Service govern your use of the BidSmart platform, including browsing auctions, placing bids, and listing items for sale. Please read them carefully.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground px-2">
          The Terms
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

      <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card max-w-3xl mx-auto">
        <div className="relative p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">Related policies</p>
          <p className="text-base text-muted-foreground mb-5">
            Understand the full picture of how BidSmart handles your data and agreements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/privacy"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <MdOutlineLock className="h-4 w-4 text-primary" />
              Privacy Policy
              <MdOutlineArrowForward className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
            <Link
              to="/cookies"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <MdOutlineCookie className="h-4 w-4 text-primary" />
              Cookie Policy
              <MdOutlineArrowForward className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
);

export default Terms;
