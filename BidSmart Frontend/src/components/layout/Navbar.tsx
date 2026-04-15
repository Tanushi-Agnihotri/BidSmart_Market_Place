import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineGavel, MdOutlineNotifications, MdOutlineMenu, MdOutlineClose, MdOutlinePerson, MdOutlineWbSunny, MdOutlineDarkMode, MdOutlineLogout, MdOutlineShoppingCart, MdOutlineStorefront } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { currentRole, currentUser, logout, canSwitchMode, switchMode, unreadCount } = useApp();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = location.pathname === '/';
  const isScrolled = scrolled || !isHomePage;
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/auctions', label: 'Explore' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const buyerLinks = [
    { to: '/', label: 'Home' },
    { to: '/buyer/dashboard', label: 'Dashboard' },
    { to: '/auctions', label: 'Browse' },
    { to: '/buyer/my-bids', label: 'My Bids' },
    { to: '/buyer/watchlist', label: 'Watchlist' },
  ];

  const sellerLinks = [
    { to: '/', label: 'Home' },
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/products', label: 'Products' },
    { to: '/seller/products/new', label: 'Add Product' },
  ];

  const adminLinks = [
    { to: '/', label: 'Home' },
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
  ];

  const authLinks =
    currentRole === 'buyer' ? buyerLinks
    : currentRole === 'seller' ? sellerLinks
    : currentRole === 'admin' ? adminLinks
    : [];

  const links = currentRole === 'guest' ? guestLinks : authLinks;

  const handleSwitchMode = () => {
    if (currentUser?.role === 'buyer' && currentRole === 'buyer') {
      navigate('/become-seller');
      return;
    }
    const nextMode = currentRole === 'buyer' ? 'seller' : 'buyer';
    switchMode();
    navigate(nextMode === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard');
  };

  const ModeSwitchBadge = () => (
    <div
      onClick={handleSwitchMode}
      className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 cursor-pointer transition-all hover:border-primary/30"
      title={currentRole === 'buyer' ? 'Switch to Seller Mode' : 'Switch to Buyer Mode'}
    >
      <div className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold transition-all",
        currentRole === 'buyer' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      )}>
        <MdOutlineShoppingCart className="h-4 w-4" />
        Buyer
      </div>
      <div className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold transition-all",
        currentRole === 'seller' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
      )}>
        <MdOutlineStorefront className="h-4 w-4" />
        Seller
      </div>
    </div>
  );

  if (isAuthRoute) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-3">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-md">
              <MdOutlineGavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight gradient-gold-text">
              BidSmart
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-5 w-5" /> : <MdOutlineDarkMode className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      isScrolled ? "glass-dark py-3" : "bg-gradient-to-b from-black/50 to-transparent py-4"
    )}>
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-md">
            <MdOutlineGavel className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight gradient-gold-text">
            BidSmart
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-lg px-3 py-1.5 text-lg font-medium transition-all duration-200",
                location.pathname === l.to
                  ? isScrolled
                    ? "text-primary bg-primary/10"
                    : "text-white bg-white/15"
                  : isScrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "rounded-lg p-2 transition-all",
              isScrolled ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-5 w-5" /> : <MdOutlineDarkMode className="h-5 w-5" />}
          </button>

          {currentRole === 'guest' ? (
            <>
              <Link to="/login" className={cn(
                "rounded-lg border px-4 py-1.5 text-lg font-medium transition-all",
                isScrolled ? "border-border text-foreground hover:bg-muted" : "border-white/25 text-white hover:bg-white/10"
              )}>
                Login
              </Link>
              <Link to="/register" className="rounded-lg gradient-gold px-4 py-1.5 text-lg font-bold text-primary-foreground transition-all hover:opacity-90">
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Mode Switch */}
              {canSwitchMode && <ModeSwitchBadge />}

              {/* Notifications */}
              <Link to="/notifications" className={cn(
                "relative rounded-lg p-2 transition-all",
                isScrolled ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-white/60 hover:text-white hover:bg-white/10"
              )}>
                <MdOutlineNotifications className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center ring-2 ring-background px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <Link to="/profile" className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-lg font-medium transition-all",
                isScrolled
                  ? "border-border bg-muted/40 text-foreground hover:bg-muted"
                  : "border-white/15 bg-white/8 text-white hover:bg-white/15"
              )}>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                  <MdOutlinePerson className="h-3 w-3 text-primary" />
                </div>
                {currentUser?.name?.split(' ')[0]}
              </Link>

              {/* Logout */}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className={cn(
                  "rounded-lg p-2 transition-all",
                  isScrolled ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title="Logout"
              >
                <MdOutlineLogout className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-5 w-5" /> : <MdOutlineDarkMode className="h-5 w-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-foreground hover:bg-muted transition-colors">
            {mobileOpen ? <MdOutlineClose className="h-5 w-5" /> : <MdOutlineMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto flex flex-col gap-0.5 p-4">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-lg font-medium transition-colors",
                  location.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </Link>
            ))}
            {canSwitchMode && (
              <button
                onClick={handleSwitchMode}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-lg font-medium transition-all hover:border-primary/30"
              >
                {currentRole === 'buyer' ? <MdOutlineStorefront className="h-4 w-4 text-primary" /> : <MdOutlineShoppingCart className="h-4 w-4 text-primary" />}
                Switch to {currentRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
              </button>
            )}
            {currentRole === 'guest' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Link to="/login" className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-lg font-medium">Login</Link>
                <Link to="/register" className="flex-1 rounded-lg gradient-gold px-4 py-2.5 text-center text-lg font-bold text-primary-foreground">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
