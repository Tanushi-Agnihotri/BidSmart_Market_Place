import { useState } from 'react';
import {
  MdOutlineEmail as Mail, MdOutlineAccessTime as Clock, MdOutlineSend as Send,
  MdOutlineCheckCircle as CheckCircle, MdOutlineLocationOn as Location,
  MdOutlineQuestionAnswer as FAQ, MdOutlineArrowForward as ArrowRight,
} from 'react-icons/md';
import { toast } from 'sonner';
import heroImg from '@/assets/hero-auction.jpg';
import artImg from '@/assets/auction-art.jpg';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields before sending.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
    if (!accessKey) {
      toast.error('Contact form is not configured yet. Please try again later.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: name.trim(),
          email: email.trim(),
          subject: `[BidSmart Contact] ${subject}`,
          message: message.trim(),
          from_name: 'BidSmart Contact Form',
          replyto: email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        toast.success("Message sent! We'll get back to you soon.", {
          icon: <CheckCircle className="h-5 w-5 text-success" />,
        });
        setName('');
        setEmail('');
        setSubject('General Inquiry');
        setMessage('');
      } else {
        toast.error(data?.message || 'Could not send your message. Please try again.');
      }
    } catch (err) {
      toast.error('Network error — please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover animate-hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
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
        <div className="container relative mx-auto px-4 pt-28 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2 mb-6 animate-float-up animate-border-glow">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Get In Touch</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-white mb-4 tracking-tight animate-float-up delay-100" style={{ animationFillMode: 'both' }}>
              Contact &<br />
              <span className="gradient-text-animated">Support</span>
            </h1>
            <p className="text-lg text-white/65 max-w-lg leading-relaxed animate-float-up delay-300" style={{ animationFillMode: 'both' }}>
              Have a question or need help? We're here to assist you with anything related to BidSmart.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════ CONTACT INFO CARDS ═══════════ */}
      <section className="relative overflow-hidden bg-card border-y border-border">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border relative z-10">
          {[
            { icon: Mail, title: 'Email Us', value: 'bidsmart.marketplace@gmail.com', sub: 'We reply within 24 hours' },
            { icon: Clock, title: 'Support Hours', value: 'Mon - Fri: 9AM - 6PM IST', sub: 'Weekend support via email' },
            { icon: Location, title: 'Location', value: 'India', sub: 'Serving customers worldwide' },
          ].map((item, i) => (
            <div key={item.title} className="group flex items-center gap-4 px-8 py-8 transition-colors hover:bg-primary/[0.02] animate-float-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-elegant icon-ring">
                <item.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FORM + FAQ ═══════════ */}
      <section className="relative overflow-hidden section-bg-art">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 rounded-2xl glass-card p-8 md:p-10 sparkle-hover animate-float-up" style={{ animationFillMode: 'both' }}>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Send a Message</h2>
              <p className="text-sm text-muted-foreground mb-8">Fill in the form below and we'll get back to you shortly.</p>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    disabled={sending}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    disabled={sending}
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="text-sm font-medium mb-2 block text-foreground">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  disabled={sending}
                >
                  <option>General Inquiry</option>
                  <option>Support Request</option>
                  <option>Bug Report</option>
                  <option>Seller Inquiry</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div className="mb-8">
                <label className="text-sm font-medium mb-2 block text-foreground">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none transition-all"
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="group inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-3.5 font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
                {sending ? 'Sending…' : 'Send Message'}
                {!sending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            {/* FAQ Sidebar */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 icon-ring">
                  <FAQ className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">FAQ</h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'How do I place a bid?', a: 'Navigate to any active auction, enter your bid amount, and click "Place Bid".' },
                  { q: 'Is my payment secure?', a: 'All transactions are encrypted with SSL and we use escrow protection.' },
                  { q: 'Can I sell on BidSmart?', a: 'Yes! Register as a seller, complete verification, and start listing.' },
                  { q: 'What happens if I win?', a: 'You\'ll receive a notification. Payment is released upon delivery confirmation.' },
                  { q: 'How does watchlist work?', a: 'Click the heart icon on any auction. You\'ll get notified before it ends.' },
                  { q: 'Can I cancel a bid?', a: 'Bids are binding. In exceptional cases, contact support for help.' },
                ].map(({ q, a }, i) => (
                  <div key={q} className="group rounded-xl glass-card p-4 hover-lift animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{q}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative overflow-hidden bg-card border-t border-border">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute -top-20 -right-32 w-[450px] h-[450px] opacity-[0.03] pointer-events-none rotate-12">
          <img src={artImg} alt="" className="w-full h-full object-cover rounded-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Browse our auctions or learn more about how BidSmart works.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/auctions" className="group inline-flex items-center gap-2 rounded-xl gradient-gold px-6 py-3 font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg">
              Browse Auctions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="/about" className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary">
              About BidSmart
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
