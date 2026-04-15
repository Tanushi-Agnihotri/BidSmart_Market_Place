import { MdOutlineGavel, MdOutlineSecurity, MdOutlineCheckCircle, MdOutlineVerified } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const Footer = () => {
  const location = useLocation();
  if (AUTH_ROUTES.includes(location.pathname)) return null;
  const isHome = location.pathname === '/';

  return (
  <footer className="relative border-t border-border overflow-hidden">
    {/* Rich gradient background */}
    <div className="absolute inset-0 bg-gradient-to-b from-card via-card to-background" />
    <div className="absolute inset-0 bg-dot-pattern opacity-20" />

    <div className={`container mx-auto px-4 ${isHome ? 'py-16' : 'py-3'} relative z-10`}>
      {isHome && (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-elegant">
              <MdOutlineGavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-gold-text">BidSmart</span>
          </Link>
          <p className="text-lg text-muted-foreground">The intelligent online auction platform. Bid smarter, win faster.</p>
        </div>
        {[
          { title: 'Platform', links: [['Browse Auctions', '/auctions'], ['How It Works', '/about'], ['Contact', '/contact']] },
          { title: 'For Buyers', links: [['Start Bidding', '/auctions'], ['My Bids', '/buyer/my-bids'], ['Watchlist', '/buyer/watchlist']] },
          { title: 'For Sellers', links: [['List a Product', '/seller/products/new'], ['Seller Dashboard', '/seller/dashboard'], ['Results', '/seller/results']] },
          { title: 'Legal', links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies']] },
        ].map(section => (
          <div key={section.title}>
            <h4 className="font-display font-semibold text-foreground mb-4">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-lg text-muted-foreground hover:text-primary transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      )}

      <div className={`${isHome ? 'mt-12 border-t border-border pt-8' : ''} flex flex-wrap justify-center gap-3 md:gap-4`}>
        {[
          { icon: MdOutlineSecurity, label: 'SSL Secured' },
          { icon: MdOutlineCheckCircle, label: 'Verified Sellers' },
          { icon: MdOutlineVerified, label: 'Money-back Guarantee' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="group flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-foreground hover:shadow-md"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 transition-colors group-hover:from-primary/30 group-hover:to-primary/10">
              <Icon className="h-3 w-3 text-primary" />
            </div>
            {label}
          </div>
        ))}
      </div>

      <div className={`${isHome ? 'mt-8 gap-2' : 'mt-2 gap-1'} flex flex-col items-center`}>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} <span className="font-semibold gradient-gold-text">BidSmart</span>. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
