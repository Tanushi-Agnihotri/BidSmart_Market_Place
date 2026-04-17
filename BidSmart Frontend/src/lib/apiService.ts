import { apiUrl } from './api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEY = 'bidsmart.auth';

function getToken(): string | null {
  try {
    // Check sessionStorage first (active tab session), then localStorage (remember-me)
    const raw =
      sessionStorage.getItem(AUTH_STORAGE_KEY) ??
      localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { token: string }).token;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> || {}) },
  });
  if (!res.ok) {
    // Handle expired/invalid token — clear auth and reload so user can re-login
    if ((res.status === 401 || res.status === 403) && getToken() && !path.includes('/admin')) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.reload();
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    const body = await res.json().catch(() => ({}));
    // Backend returns { message: "..." } or { error: "..." } or { validationErrors: [...] }
    const message = body.message || body.error || 'Request failed';
    throw new ApiError(res.status, message, body.validationErrors);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public validationErrors?: { field: string; message: string }[]
  ) {
    super(message);
  }
}

// ─── Types (matching backend responses) ─────────────────────────────────────

export interface ApiAuction {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string; // "New", "Like New", etc.
  basePrice: number;
  currentBid: number;
  bidIncrement: number;
  totalBids: number;
  watchlistCount: number;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ENDING_SOON' | 'CLOSED';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationReason: string | null;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  images: string[];
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ApiAdminSeller {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  storeName: string;
  businessCategory: string;
  description: string | null;
  legalName: string;
  idDocumentUrl: string;
  status: VerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ApiImageResponse {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  sortOrder: number;
}

export interface ApiBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  createdAt: string;
}

export interface ApiNotification {
  id: string;
  type: 'BID' | 'AUCTION' | 'SYSTEM';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ApiWatchlistItem {
  id: string;
  auction: ApiAuction;
  addedAt: string;
}

export interface ApiWatchlistStatus {
  inWatchlist: boolean;
  message: string;
}

export interface ApiDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalAuctions: number;
  activeAuctions: number;
  closedAuctions: number;
  totalBids: number;
  totalRevenue: number;
}

export interface ApiAdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

// ─── Mappers (backend -> frontend types) ────────────────────────────────────

import type { Auction, Bid } from '@/data/mockData';

const statusMap: Record<string, Auction['status']> = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDING_SOON: 'ending-soon',
  CLOSED: 'closed',
};

export function toFrontendAuction(a: ApiAuction): Auction {
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    description: a.description,
    sellerId: a.sellerId,
    sellerName: a.sellerName,
    condition: a.condition,
    basePrice: a.basePrice,
    currentBid: a.currentBid,
    bidIncrement: a.bidIncrement,
    startTime: a.startTime,
    endTime: a.endTime,
    status: statusMap[a.status] || 'active',
    images: (a.images || []).map(img => img.startsWith('/') ? apiUrl(img) : img),
    totalBids: a.totalBids,
    watchlistCount: a.watchlistCount,
    verificationStatus: a.verificationStatus,
    verificationReason: a.verificationReason,
  };
}

export function toFrontendBid(b: ApiBid): Bid {
  return {
    id: b.id,
    auctionId: b.auctionId,
    bidderId: b.bidderId,
    bidderName: b.bidderName,
    amount: b.amount,
    timestamp: b.createdAt,
  };
}

// ─── API Functions ──────────────────────────────────────────────────────────

// Auctions
export const auctionApi = {
  getAll: (params?: { category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<ApiAuction[]>(`/api/auctions${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => request<ApiAuction>(`/api/auctions/${id}`),
  getCategoryCounts: () => request<Record<string, number>>('/api/auctions/category-counts'),
  getBySeller: (sellerId: string) => request<ApiAuction[]>(`/api/auctions/seller/${sellerId}`),
  create: (data: {
    title: string;
    category: string;
    description?: string;
    condition: string;
    basePrice: number;
    bidIncrement: number;
    durationHours: number;
    scheduledStartTime?: string; // ISO 8601 datetime, null = start immediately
  }) => request<ApiAuction>('/api/auctions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: {
    title?: string;
    category?: string;
    description?: string;
    condition?: string;
    basePrice?: number;
    bidIncrement?: number;
  }) => request<ApiAuction>(`/api/auctions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/auctions/${id}`, { method: 'DELETE' }),
};

// Bids
export const bidApi = {
  place: (auctionId: string, amount: number) =>
    request<ApiBid>('/api/bids', { method: 'POST', body: JSON.stringify({ auctionId, amount }) }),
  getByAuction: (auctionId: string) => request<ApiBid[]>(`/api/bids/auction/${auctionId}`),
  getMine: () => request<ApiBid[]>('/api/bids/my'),
};

// Watchlist
export const watchlistApi = {
  toggle: (auctionId: string) =>
    request<ApiWatchlistStatus>(`/api/watchlist/${auctionId}`, { method: 'POST' }),
  getMine: () => request<ApiWatchlistItem[]>('/api/watchlist'),
  check: (auctionId: string) => request<ApiWatchlistStatus>(`/api/watchlist/check/${auctionId}`),
};

// Seller profile (own)
export interface ApiMySellerProfile {
  status: VerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  storeName: string;
}

export const sellerProfileApi = {
  getMine: () => request<ApiMySellerProfile>('/api/users/me/seller-profile'),
};

// Notifications
export const notificationApi = {
  getMine: () => request<ApiNotification[]>('/api/notifications'),
  markRead: (id: string) =>
    request<ApiNotification>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    request<{ markedAsRead: number }>('/api/notifications/read-all', { method: 'PATCH' }),
};

// Images
export const imageApi = {
  upload: async (auctionId: string, file: File): Promise<ApiImageResponse> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(apiUrl(`/api/auctions/${auctionId}/images`), {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message || 'Upload failed');
    }

    return res.json();
  },
  getByAuction: (auctionId: string) =>
    request<ApiImageResponse[]>(`/api/auctions/${auctionId}/images`),
  delete: (auctionId: string, imageId: string) =>
    request<void>(`/api/auctions/${auctionId}/images/${imageId}`, { method: 'DELETE' }),
};

// Users
export interface ApiNotifPrefs {
  emailBids: boolean;
  emailAuctions: boolean;
  emailNewsletter: boolean;
  pushBids: boolean;
  pushEnding: boolean;
}

export type ApiUserProfile = { id: string; fullName: string; email: string; role: string; status: string; createdAt: string; phone: string | null; bio: string | null; location: string | null };

export const userApi = {
  getProfile: () => request<ApiUserProfile>('/api/users/me'),

  updateProfile: (data: { fullName: string; email: string; phone?: string; bio?: string; location?: string }) =>
    request<ApiUserProfile>(
      '/api/users/me',
      { method: 'PATCH', body: JSON.stringify(data) },
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<void>('/api/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNotifPrefs: () =>
    request<ApiNotifPrefs>('/api/users/me/notification-preferences'),

  updateNotifPrefs: (data: Partial<ApiNotifPrefs>) =>
    request<ApiNotifPrefs>('/api/users/me/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  becomeSeller: async (formData: FormData): Promise<void> => {
    const token = getToken();
    const res = await fetch(apiUrl('/api/users/me/seller-profile'), {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message || 'Application failed', body.validationErrors);
    }
  },
};

// Public Stats
export interface ApiPublicStats {
  totalAuctions: number;
  totalBids: number;
  activeUsers: number;
  totalRevenue: number;
}

export const statsApi = {
  getPublic: () => request<ApiPublicStats>('/api/stats'),
};

// Admin
export const adminApi = {
  getStats: () => request<ApiDashboardStats>('/api/admin/dashboard/stats'),
  getCharts: () => request<{
    monthlyRevenue: { month: string; revenue: number }[];
    dailyBids: { day: string; bids: number }[];
    categoryData: { name: string; value: number }[];
  }>('/api/admin/dashboard/charts'),
  getUsers: () => request<ApiAdminUser[]>('/api/admin/users'),
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') =>
    request<ApiAdminUser>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateUserRole: (userId: string, role: 'BUYER' | 'SELLER') =>
    request<ApiAdminUser>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (userId: string) =>
    request<void>(`/api/admin/users/${userId}`, { method: 'DELETE' }),
  deleteAuction: (auctionId: string) =>
    request<void>(`/api/admin/auctions/${auctionId}`, { method: 'DELETE' }),

  getSellers: (status?: VerificationStatus) => {
    const qs = status ? `?status=${status}` : '';
    return request<ApiAdminSeller[]>(`/api/admin/sellers${qs}`);
  },
  verifySeller: (id: string, decision: 'VERIFIED' | 'REJECTED', reason?: string) =>
    request<ApiAdminSeller>(`/api/admin/sellers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, reason }),
    }),
  getAuctionsByVerification: (verificationStatus?: VerificationStatus) => {
    const qs = verificationStatus ? `?verificationStatus=${verificationStatus}` : '';
    return request<ApiAuction[]>(`/api/admin/auctions${qs}`);
  },
  verifyAuction: (id: string, decision: 'VERIFIED' | 'REJECTED', reason?: string) =>
    request<ApiAuction>(`/api/admin/auctions/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, reason }),
    }),
};
