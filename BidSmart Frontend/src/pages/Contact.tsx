import { useState } from 'react';
import { MdOutlineEmail as Mail, MdOutlineAccessTime as Clock, MdOutlineSend as Send, MdOutlineCheckCircle as CheckCircle } from 'react-icons/md';
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
      {/* Hero with background image */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-5px',
                animation: `particle-rise ${Math.random() * 7 + 5}s linear ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-center mb-4 text-white animate-float-up">Contact & Support</h1>
          <p className="text-center text-white/70 mb-8 max-w-lg mx-auto text-lg animate-float-up delay-200" style={{ animationFillMode: 'both' }}>Have questions? We're here to help.</p>
        </div>
      </section>

      {/* Main content */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-floating-orbs" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Mail, title: 'Email', value: 'bidsmart.marketplace@gmail.com' },
                { icon: Clock, title: 'Support Hours', value: 'Mon-Fri: 9AM-6PM EST' },
              ].map(({ icon: Icon, title, value }, i) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 transition-all hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-soft animate-float-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                  <div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-base font-semibold">{title}</p>
                    <p className="text-base text-muted-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-card animate-float-up delay-200" style={{ animationFillMode: 'both' }}>
              <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-base font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    disabled={sending}
                  />
                </div>
                <div>
                  <label className="text-base font-medium mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    disabled={sending}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-base font-medium mb-1.5 block">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={sending}
                >
                  <option>General Inquiry</option>
                  <option>Support Request</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="text-base font-medium mb-1.5 block">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-2xl gradient-gold px-8 py-3 font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ with background image */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute -top-20 -right-32 w-[450px] h-[450px] opacity-[0.03] pointer-events-none rotate-12">
          <img src={artImg} alt="" className="w-full h-full object-cover rounded-3xl" />
        </div>
        <div className="absolute inset-0 bg-lines-pattern" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <h2 className="font-display text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { q: 'How do I place a bid?', a: 'Navigate to any active auction, enter your bid amount above the minimum, and click "Place Bid". You\'ll receive confirmation instantly.' },
              { q: 'Is my payment secure?', a: 'Absolutely. All transactions are encrypted with SSL and we use escrow protection until delivery is confirmed.' },
              { q: 'Can I sell on BidSmart?', a: 'Yes! Register as a seller, complete verification, and you can list items for auction immediately.' },
              { q: 'What happens if I win?', a: 'You\'ll receive a notification and receipt. The seller will arrange shipping, and payment is released upon delivery confirmation.' },
              { q: 'How does the watchlist work?', a: 'Click the heart icon on any auction to add it to your watchlist. You\'ll get notifications before it ends.' },
              { q: 'Can I cancel a bid?', a: 'Bids are binding. Please bid carefully. In exceptional cases, contact support for assistance.' },
            ].map(({ q, a }, i) => (
              <div key={q} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-soft sparkle-hover animate-float-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                <h3 className="font-display text-lg font-semibold mb-2">{q}</h3>
                <p className="text-base text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
