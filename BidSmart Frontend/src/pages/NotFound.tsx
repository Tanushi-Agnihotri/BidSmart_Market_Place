import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MdOutlineGavel, MdOutlineHome, MdOutlineSearch } from "react-icons/md";
import heroImg from '@/assets/hero-auction.jpg';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="" className="w-full h-full object-cover animate-hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      </div>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/25"
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
      <div className="relative z-10 text-center px-4 animate-float-up">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm mx-auto mb-8 animate-pulse-glow">
          <MdOutlineGavel className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-8xl md:text-9xl font-bold gradient-text-animated mb-4">404</h1>
        <p className="text-2xl text-white/80 mb-2 font-display font-semibold">Page Not Found</p>
        <p className="text-lg text-white/50 mb-10 max-w-md mx-auto">The auction you're looking for might have ended or the page doesn't exist.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-3.5 text-base font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.03]">
            <MdOutlineHome className="h-5 w-5" /> Go Home
          </Link>
          <Link to="/auctions" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-white/20">
            <MdOutlineSearch className="h-5 w-5" /> Browse Auctions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
