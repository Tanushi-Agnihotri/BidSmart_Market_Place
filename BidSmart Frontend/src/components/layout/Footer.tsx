import { MdOutlineGavel, MdOutlineSecurity, MdOutlineCheckCircle, MdOutlineVerified, MdOutlineArrowForward, MdOutlineEmail, MdOutlineLocationOn } from 'react-icons/md';
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
  <footer className="relative border-t border-border overflow-hidden">
    {/* Background layers */}
    <div className="absolute inset-0 bg-gradient-to-b from-card via-card/95 to-background" />
    <div className="absolute inset-0 bg-dot-pattern opacity-15" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.03] rounded-full blur-3xl" />

    <div className={`container mx-auto px-4 ${isHome ? 'py-1.5' : 'py-1.5'} relative z-10`}>
      {(isHome || !isLoggedIn) && (
      <>
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-elegant">
                <MdOutlineGavel className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold gradient-gold-text">BidSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              The intelligent online auction platform. Bid smarter, win faster. Trusted by collectors worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MdOutlineEmail className="h-4 w-4 text-primary/70" />
                <span>bidsmart.marketplace@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MdOutlineLocationOn className="h-4 w-4 text-primary/70" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'Platform', links: [['Browse Auctions', '/auctions'], ['How It Works', '/about'], ['Contact Us', '/contact']] },
            { title: 'For Buyers', links: [['Start Bidding', '/auctions'], ['My Bids', '/buyer/my-bids'], ['Watchlist', '/buyer/watchlist']] },
            { title: 'For Sellers', links: [['List a Product', '/seller/products/new'], ['Seller Dashboard', '/seller/dashboard'], ['Results', '/seller/results']] },
            { title: 'Legal', links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies']] },
          ].map(section => (
            <div key={section.title} className="col-span-1 md:col-span-2">
              <h4 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span className="h-px w-0 bg-primary transition-all group-hover:w-3 group-hover:mr-1" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-10 mb-5 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </>
      )}

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: MdOutlineSecurity, label: 'SSL Secured' },
          { icon: MdOutlineCheckCircle, label: 'Verified Sellers' },
          { icon: MdOutlineVerified, label: 'Money-back Guarantee' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="group flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-foreground hover:shadow-md"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 transition-colors group-hover:from-primary/30 group-hover:to-primary/10">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            {label}
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className={`${isHome ? 'mt-1' : 'mt-1'} flex flex-col items-center gap-0`}>
        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} <span className="font-semibold gradient-gold-text">BidSmart</span>. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
