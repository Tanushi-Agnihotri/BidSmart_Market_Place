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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isHomePage = location.pathname === '/';
  const isScrolled = scrolled || !isHomePage;
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

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
    { to: '/admin/reports', label: 'Reports' },
  ];

  const authLinks =
    currentRole === 'buyer' ? buyerLinks
    : currentRole === 'seller' ? sellerLinks
    : currentRole === 'admin' ? adminLinks
    : [];

  const links = currentRole === 'guest' ? guestLinks : authLinks;

  const handleClickBuyer = () => {
    if (currentRole === 'buyer') return;
    switchMode();
    navigate('/buyer/dashboard');
  };

  const handleClickSeller = () => {
    if (currentRole === 'seller') return;
    if (currentUser?.role === 'buyer') {
      navigate('/become-seller');
      return;
    }
    switchMode();
    navigate('/seller/dashboard');
  };

  const ModeSwitchBadge = () => (
    <div className="flex items-center rounded-full border border-border/60 bg-muted/40 p-0.5 cursor-pointer transition-all hover:border-primary/30">
      <div
        onClick={handleClickBuyer}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
          currentRole === 'buyer' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
        title="Switch to Buyer Mode"
      >
        <MdOutlineShoppingCart className="h-3.5 w-3.5" />
        Buyer
      </div>
      <div
        onClick={handleClickSeller}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
          currentRole === 'seller' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
        title="Switch to Seller Mode"
      >
        <MdOutlineStorefront className="h-3.5 w-3.5" />
        Seller
      </div>
    </div>
  );

  if (shouldHideNavbar) {
    return null;
  }

  if (isAuthRoute) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-1">
        <div className="flex items-center justify-between px-6 sm:px-10">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-md">
              <MdOutlineGavel className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight gradient-gold-text">
              BidSmart
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-4 w-4" /> : <MdOutlineDarkMode className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      isScrolled ? "glass-dark py-1" : "bg-gradient-to-b from-black/50 to-transparent py-1.5"
    )}>
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 shadow-sm transition-all group-hover:shadow-md group-hover:scale-105">
            <MdOutlineGavel className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight gradient-gold-text">
            BidSmart
          </span>
        </Link>

        {/* Desktop Nav Links — centered */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200",
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
        <div className="hidden md:flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "rounded-lg p-1.5 transition-all",
              isScrolled ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-4 w-4" /> : <MdOutlineDarkMode className="h-4 w-4" />}
          </button>

          {currentRole === 'guest' ? (
            <>
              <Link to="/login" className={cn(
                "rounded-lg border px-3.5 py-1 text-sm font-medium transition-all",
                isScrolled ? "border-border text-foreground hover:bg-muted" : "border-white/25 text-white hover:bg-white/10"
              )}>
                Login
              </Link>
              <Link to="/register" className="rounded-lg gradient-gold px-3.5 py-1 text-sm font-bold text-primary-foreground transition-all hover:opacity-90">
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Mode Switch */}
              {canSwitchMode && <ModeSwitchBadge />}

              {/* Notifications */}
              <Link to="/notifications" className={cn(
                "relative rounded-lg p-1.5 transition-all",
                isScrolled ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-white/60 hover:text-white hover:bg-white/10"
              )}>
                <MdOutlineNotifications className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground flex items-center justify-center ring-2 ring-background px-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium transition-all",
                    isScrolled
                      ? "border-border bg-muted/40 text-foreground hover:bg-muted"
                      : "border-white/15 bg-white/8 text-white hover:bg-white/15"
                  )}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <MdOutlinePerson className="h-3 w-3 text-primary" />
                  </div>
                  {currentUser?.name?.split(' ')[0]}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden animate-fade-in">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <MdOutlinePerson className="h-4 w-4 text-muted-foreground" />
                        My Profile
                      </Link>
                      <div className="h-px bg-border" />
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); navigate('/login'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <MdOutlineLogout className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MdOutlineWbSunny className="h-4 w-4" /> : <MdOutlineDarkMode className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-1.5 text-foreground hover:bg-muted transition-colors">
            {mobileOpen ? <MdOutlineClose className="h-5 w-5" /> : <MdOutlineMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="flex flex-col gap-0.5 px-6 py-3">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  location.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </Link>
            ))}
            {canSwitchMode && (
              <button
                onClick={currentRole === 'buyer' ? handleClickSeller : handleClickBuyer}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium transition-all hover:border-primary/30"
              >
                {currentRole === 'buyer' ? <MdOutlineStorefront className="h-4 w-4 text-primary" /> : <MdOutlineShoppingCart className="h-4 w-4 text-primary" />}
                Switch to {currentRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
              </button>
            )}
            {currentRole === 'guest' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Link to="/login" className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-medium">Login</Link>
                <Link to="/register" className="flex-1 rounded-lg gradient-gold px-4 py-2 text-center text-sm font-bold text-primary-foreground">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
