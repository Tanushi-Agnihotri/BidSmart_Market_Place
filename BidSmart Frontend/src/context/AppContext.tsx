import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type UserRole, type User, type Auction, type Bid, type Notification, mockUsers, mockAuctions } from '@/data/mockData';
import { auctionApi, bidApi, watchlistApi, notificationApi, toFrontendAuction, toFrontendBid } from '@/lib/apiService';

const AUTH_STORAGE_KEY = 'bidsmart.auth';

type StoredAuth = {
  token: string;
  user: User;
};

interface AppState {
  currentRole: UserRole;
  activeMode: 'buyer' | 'seller' | 'admin' | 'guest';
  canSwitchMode: boolean;
  currentUser: User | null;
  authToken: string | null;
  auctions: Auction[];
  bids: Bid[];
  watchlist: string[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  setRole: (role: UserRole) => void;
  upgradeRole: (role: UserRole) => void;
  switchMode: () => void;
  setAuthenticatedSession: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
  deleteAuction: (auctionId: string) => Promise<boolean>;
  toggleWatchlist: (auctionId: string) => Promise<void>;
  refreshAuctions: () => Promise<void>;
  refreshBids: (auctionId?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateCurrentUser: (partial: Partial<User>) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const readStoredAuth = (): StoredAuth | null => {
  if (typeof window === 'undefined') return null;

  try {
    // sessionStorage takes precedence — it's the "active tab" session.
    // If not present there, fall back to localStorage (remember-me persistent session).
    const raw =
      window.sessionStorage.getItem(AUTH_STORAGE_KEY) ??
      window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

const persistAuth = (auth: StoredAuth | null, rememberMe?: boolean) => {
  if (typeof window === 'undefined') return;

  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  let targetStorage: Storage;
  if (rememberMe === true) {
    targetStorage = window.localStorage;
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else if (rememberMe === false) {
    targetStorage = window.sessionStorage;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    // No explicit choice: preserve whichever storage currently holds the session.
    const inSession = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    targetStorage = inSession ? window.sessionStorage : window.localStorage;
  }

  targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedAuth = readStoredAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>(storedAuth?.user.role ?? 'guest');
  const [currentUser, setCurrentUser] = useState<User | null>(storedAuth?.user ?? null);
  const [authToken, setAuthToken] = useState<string | null>(storedAuth?.token ?? null);
  // activeMode: the view currently showing (buyer or seller). Defaults to the user's primary role.
  const [activeMode, setActiveMode] = useState<'buyer' | 'seller' | 'admin' | 'guest'>(
    (storedAuth?.user.role as 'buyer' | 'seller' | 'admin' | 'guest') ?? 'guest'
  );
  const [auctions, setAuctions] = useState<Auction[]>(mockAuctions);
  const [bids, setBids] = useState<Bid[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // A buyer or seller can switch modes; admin and guest cannot.
  const canSwitchMode = activeMode === 'buyer' || activeMode === 'seller';

  // Fetch auctions from API on mount
  const refreshAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const apiAuctions = await auctionApi.getAll();
      setAuctions(apiAuctions.map(toFrontendAuction));
    } catch {
      console.info('Backend not available, using mock data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bids from API
  const refreshBids = useCallback(async (auctionId?: string) => {
    try {
      if (auctionId) {
        const apiBids = await bidApi.getByAuction(auctionId);
        setBids(prev => {
          const otherBids = prev.filter(b => b.auctionId !== auctionId);
          return [...otherBids, ...apiBids.map(toFrontendBid)];
        });
      } else if (authToken) {
        const apiBids = await bidApi.getMine();
        setBids(apiBids.map(toFrontendBid));
      }
    } catch (err) {
      console.error('[refreshBids] Failed to fetch bids:', err);
    }
  }, [authToken]);

  const refreshNotifications = useCallback(async () => {
    if (!authToken) return;
    try {
      const apiNotifs = await notificationApi.getMine();
      setNotifications(apiNotifs.map(n => ({
        id: n.id,
        userId: currentUser?.id || '',
        role: currentRole,
        type: n.type.toLowerCase() as any,
        title: n.title,
        body: n.body,
        timestamp: n.createdAt,
        read: n.read,
      })));
    } catch {
      // Keep existing notifications
    }
  }, [authToken, currentUser, currentRole]);

  const markNotificationRead = useCallback(async (id: string) => {
    // Optimistic update with rollback on failure
    const prev = notifications;
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    if (authToken) {
      try {
        await notificationApi.markRead(id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
        setNotifications(prev); // rollback
      }
    }
  }, [authToken, notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    const prev = notifications;
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    if (authToken) {
      try {
        await notificationApi.markAllRead();
      } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
        setNotifications(prev); // rollback
      }
    }
  }, [authToken, notifications]);

  // Fetch watchlist on auth
  const refreshWatchlist = useCallback(async () => {
    if (!authToken) return;
    try {
      const items = await watchlistApi.getMine();
      setWatchlist(items.map(item => item.auction.id));
    } catch {
      // Keep empty watchlist
    }
  }, [authToken]);

  // Load data on mount
  useEffect(() => {
    refreshAuctions();
  }, [refreshAuctions]);

  // Load data when authenticated
  useEffect(() => {
    if (authToken) {
      refreshWatchlist();
      refreshNotifications();
      refreshBids();
    }
  }, [authToken, refreshWatchlist, refreshNotifications, refreshBids]);

  // Poll notifications every 30 seconds while authenticated
  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [authToken, refreshNotifications]);

  const setRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    setActiveMode(role as 'buyer' | 'seller' | 'admin' | 'guest');
    setAuthToken(null);

    const nextUser = role === 'guest'
      ? null
      : mockUsers.find(u => u.role === role) || null;

    setCurrentUser(nextUser);
    setWatchlist([]);
    persistAuth(null);
  }, []);

  const upgradeRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    setActiveMode(role as 'buyer' | 'seller' | 'admin' | 'guest');
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      if (authToken) {
        persistAuth({ user: updatedUser, token: authToken });
      }
    }
  }, [currentUser, authToken]);

  const switchMode = useCallback(() => {
    if (!canSwitchMode) return;
    const next = activeMode === 'buyer' ? 'seller' : 'buyer';
    setActiveMode(next);
    setCurrentRole(next as UserRole);
  }, [activeMode, canSwitchMode]);

  const setAuthenticatedSession = useCallback((user: User, token: string, rememberMe: boolean = true) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setActiveMode(user.role as 'buyer' | 'seller' | 'admin' | 'guest');
    setAuthToken(token);
    persistAuth({ user, token }, rememberMe);
  }, []);

  const updateCurrentUser = useCallback((partial: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      const storedAuth = readStoredAuth();
      if (storedAuth) {
        persistAuth({ ...storedAuth, user: updated });
      }
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setCurrentRole('guest');
    setCurrentUser(null);
    setAuthToken(null);
    setWatchlist([]);
    setNotifications([]);
    setActiveMode('guest');
    persistAuth(null);
  }, []);

  const placeBid = useCallback(async (auctionId: string, amount: number): Promise<boolean> => {
    if (!currentUser) return false;

    // If authenticated and the auction has a real UUID, use API
    if (authToken && auctionId.length > 10) {
      const apiBid = await bidApi.place(auctionId, amount);
      const newBid = toFrontendBid(apiBid);
      setBids(prev => [newBid, ...prev]);
      setAuctions(prev => prev.map(a =>
        a.id === auctionId ? { ...a, currentBid: amount, totalBids: a.totalBids + 1 } : a
      ));
      // Refresh notifications so bidder sees any immediate notifications
      refreshNotifications();
      return true;
    }

    // Demo mode - local only
    const newBid: Bid = {
      id: `b${Date.now()}`,
      auctionId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      timestamp: new Date().toISOString(),
    };
    setBids(prev => [newBid, ...prev]);
    setAuctions(prev => prev.map(a =>
      a.id === auctionId ? { ...a, currentBid: amount, totalBids: a.totalBids + 1 } : a
    ));
    return true;
  }, [currentUser, authToken]);

  const deleteAuction = useCallback(async (auctionId: string): Promise<boolean> => {
    if (authToken && auctionId.length > 10) {
      try {
        await auctionApi.delete(auctionId);
        setAuctions(prev => prev.filter(a => a.id !== auctionId));
        return true;
      } catch {
        return false;
      }
    } else {
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
      return true;
    }
  }, [authToken]);

  const toggleWatchlistFn = useCallback(async (auctionId: string) => {
    if (!authToken || auctionId.length < 10) {
      // Local-only toggle for demo mode
      setWatchlist(prev =>
        prev.includes(auctionId) ? prev.filter(id => id !== auctionId) : [...prev, auctionId]
      );
      return;
    }

    try {
      const result = await watchlistApi.toggle(auctionId);
      if (result.inWatchlist) {
        setWatchlist(prev => [...prev, auctionId]);
      } else {
        setWatchlist(prev => prev.filter(id => id !== auctionId));
      }
      setAuctions(prev => prev.map(a =>
        a.id === auctionId
          ? { ...a, watchlistCount: a.watchlistCount + (result.inWatchlist ? 1 : -1) }
          : a
      ));
    } catch {
      setWatchlist(prev =>
        prev.includes(auctionId) ? prev.filter(id => id !== auctionId) : [...prev, auctionId]
      );
    }
  }, [authToken]);

  return (
    <AppContext.Provider value={{
      currentRole, activeMode, canSwitchMode, currentUser, authToken, auctions, bids, watchlist, notifications, unreadCount, loading,
      setRole, upgradeRole, switchMode, setAuthenticatedSession, logout,
      placeBid, deleteAuction, toggleWatchlist: toggleWatchlistFn,
      refreshAuctions, refreshBids, refreshNotifications, markNotificationRead, markAllNotificationsRead, updateCurrentUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};
