import { Link } from 'react-router-dom';
import {
  MdOutlineLock,
  MdOutlineArrowBack,
  MdOutlineDescription,
  MdOutlineCookie,
  MdOutlineArrowForward,
} from 'react-icons/md';

const LAST_UPDATED = 'April 15, 2026';

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly \u2014 name, email, phone number, shipping address, payment details, and profile photo. We also collect information automatically, including IP address, device type, browser, pages viewed, and interactions with auctions. When you sign in with Google, we receive your basic Google profile information.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to operate the auction platform, verify identity, process payments, send transaction updates, prevent fraud, and improve the service. We may send occasional product announcements, which you can unsubscribe from at any time.',
  },
  {
    title: 'Sharing with Third Parties',
    body: 'We share limited information with payment processors, shipping providers, and identity verification services so they can perform their functions. We do not sell your personal data. We may disclose information if required by law or to protect the rights and safety of BidSmart, its users, or the public.',
  },
  {
    title: 'Data Retention',
    body: 'We retain account information for as long as your account is active and for a reasonable period thereafter for legal, tax, and audit purposes. Bid and transaction records are retained for 7 years to comply with financial regulations.',
  },
  {
    title: 'Security',
    body: 'We use industry-standard encryption (TLS in transit, at-rest encryption for sensitive fields), password hashing, and access controls. No system is perfectly secure \u2014 if you suspect unauthorized access to your account, contact us immediately.',
  },
  {
    title: 'Your Rights',
    body: 'You can access, correct, or delete your personal information from the profile page. You may request a copy of your data or ask us to restrict processing by contacting support. We respond to verified requests within 30 days.',
  },
  {
    title: 'Cookies & Tracking',
    body: 'BidSmart uses cookies and similar technologies to keep you signed in, remember preferences, and analyze usage. See our Cookie Policy for details on the specific cookies we use and how to manage them.',
  },
  {
    title: 'Children',
    body: 'BidSmart is not directed at users under 18. We do not knowingly collect information from minors. If you believe a minor has provided us information, please contact us so we can delete it.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this policy to reflect changes in our practices or legal requirements. Material changes will be announced on the platform or by email. The "Last updated" date above reflects the most recent revision.',
  },
  {
    title: 'Contact',
    body: 'Privacy questions can be directed to us via the Contact page. We take privacy seriously and will do our best to respond promptly.',
  },
];

const Privacy = () => (
  <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
    <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
    <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

    <div className="relative container mx-auto px-4 max-w-6xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card mb-8 transition-all"
      >
        <MdOutlineArrowBack className="h-4 w-4" /> Back to Home
      </Link>

      <div className="relative text-center mb-10">
        <div className="inline-flex items-center justify-center mb-5">
          <div className="relative">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg">
              <MdOutlineLock className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
          Legal · Privacy Policy
        </span>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Last updated {LAST_UPDATED}
        </div>
      </div>

      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-border mb-10 shadow-card max-w-3xl mx-auto">
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-6 md:p-7">
          <p className="text-lg text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">BidSmart</span> respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. It applies to your use of the BidSmart website and services.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground px-2">
          How We Handle Data
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
);

export default Privacy;
