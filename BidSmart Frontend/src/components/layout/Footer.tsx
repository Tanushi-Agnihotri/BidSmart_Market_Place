import { MdOutlineGavel, MdOutlineSecurity, MdOutlineCheckCircle, MdOutlineVerified, MdOutlineEmail, MdOutlineLocationOn } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const Footer = () => {
  const location = useLocation();
  const { currentRole } = useApp();
  const isLoggedIn = currentRole !== 'guest';
  const isHome = location.pathname === '/';

  if (AUTH_ROUTES.includes(location.pathname)) return null;

  return (
    <footer className="relative border-t border-border/60 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-card to-card" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {(isHome || !isLoggedIn) && (
          <>
            <div className="pt-14 pb-10 grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-4 lg:col-span-4">
                <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-elegant transition-all group-hover:scale-105">
                    <MdOutlineGavel className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-2xl font-bold gradient-gold-text">BidSmart</span>
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-[260px]">
                  The intelligent online auction platform. Bid smarter, win faster. Trusted by collectors worldwide.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <MdOutlineEmail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">bidsmart.marketplace@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <MdOutlineLocationOn className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">India</span>
                  </div>
                </div>
              </div>

              {/* Link columns */}
              {[
                { title: 'Platform', links: [['Browse Auctions', '/auctions'], ['About', '/about'], ['How It Works', '/about'], ['Contact Us', '/contact']] },
                { title: 'For Buyers', links: [['Start Bidding', '/auctions'], ['My Bids', '/buyer/my-bids'], ['Watchlist', '/buyer/watchlist']] },
                { title: 'For Sellers', links: [['List a Product', '/seller/products/new'], ['Seller Dashboard', '/seller/dashboard'], ['Results', '/seller/results']] },
                { title: 'Legal', links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies']] },
              ].map(section => (
                <div key={section.title} className="col-span-1 md:col-span-2">
                  <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/50 mb-5">
                    {section.title}
                  </h4>
                  <ul className="space-y-3.5">
                    {section.links.map(([label, to]) => (
                      <li key={label}>
                        <Link
                          to={to}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-0.5 inline-block"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border/80 to-transparent" />
          </>
        )}

        {/* Bottom bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {[
              { icon: MdOutlineSecurity, label: 'SSL Secured' },
              { icon: MdOutlineCheckCircle, label: 'Verified Sellers' },
              { icon: MdOutlineVerified, label: 'Money-back Guarantee' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[12px] text-muted-foreground/70">
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold gradient-gold-text">BidSmart</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
