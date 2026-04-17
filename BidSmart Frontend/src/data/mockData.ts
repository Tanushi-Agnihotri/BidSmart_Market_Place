import watchImg from '@/assets/auction-watch.jpg';
import jewelryImg from '@/assets/auction-jewelry.jpg';
import artImg from '@/assets/auction-art.jpg';
import vehicleImg from '@/assets/auction-vehicle.jpg';
import furnitureImg from '@/assets/auction-furniture.jpg';
import electronicsImg from '@/assets/auction-electronics.jpg';
import fashionImg from '@/assets/auction-fashion.jpg';
import wineImg from '@/assets/auction-wine.jpg';
import booksImg from '@/assets/auction-books.jpg';
import React from 'react';
import {
  MdOutlineWatch,
  MdOutlineColorLens,
  MdOutlineLaptop,
  MdOutlineMuseum,
  MdOutlineChair,
  MdOutlineShoppingBag,
  MdOutlineHome,
  MdOutlineDirectionsCar,
  MdOutlineMenuBook,
  MdOutlineWineBar
} from 'react-icons/md';

export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  avatar: string;
  joinDate: string;
  stats: Record<string, number>;
}

export interface Auction {
  id: string;
  title: string;
  category: string;
  description: string;
  sellerId: string;
  sellerName: string;
  condition: string;
  basePrice: number;
  currentBid: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ending-soon' | 'upcoming' | 'closed';
  images: string[];
  totalBids: number;
  watchlistCount: number;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationReason?: string | null;
  rulesAndRegulations?: string | null;
  consentRequired?: boolean;
  consentStartTime?: string | null;
  consentEndTime?: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  type: 'bid' | 'auction' | 'system';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sophia Laurent', email: 'sophia@example.com', role: 'buyer', status: 'active', avatar: '👩‍💼', joinDate: '2024-03-15', stats: { bids: 34, won: 8 } },
  { id: 'u2', name: 'James Whitmore', email: 'james@example.com', role: 'seller', status: 'active', avatar: '👨‍💼', joinDate: '2024-01-20', stats: { products: 12, revenue: 48500 } },
  { id: 'u3', name: 'Admin User', email: 'admin@bidsmart.com', role: 'admin', status: 'active', avatar: '🛡️', joinDate: '2023-12-01', stats: {} },
  { id: 'u4', name: 'Isabella Chen', email: 'isabella@example.com', role: 'buyer', status: 'active', avatar: '👩', joinDate: '2024-06-10', stats: { bids: 19, won: 3 } },
  { id: 'u5', name: 'Marcus Reid', email: 'marcus@example.com', role: 'seller', status: 'suspended', avatar: '👨', joinDate: '2024-04-05', stats: { products: 6 } },
];

const now = new Date();
const hours = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
const days = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

export const mockAuctions: Auction[] = [
  { id: 'a1', title: 'Vintage Rolex Submariner 1968', category: 'Watches & Jewelry', description: 'A pristine vintage Rolex Submariner from 1968, fully restored with original parts. This iconic timepiece features the classic no-date design with a patina dial.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'Excellent', basePrice: 12000, currentBid: 18500, bidIncrement: 500, startTime: days(-2), endTime: hours(48), status: 'active', images: [watchImg], totalBids: 24, watchlistCount: 89 },
  { id: 'a2', title: 'Art Deco Diamond Necklace', category: 'Watches & Jewelry', description: 'Stunning Art Deco diamond necklace featuring 3.5 carats of brilliant-cut diamonds set in platinum. Circa 1925.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'Very Good', basePrice: 8500, currentBid: 12200, bidIncrement: 250, startTime: days(-1), endTime: hours(18), status: 'ending-soon', images: [jewelryImg], totalBids: 18, watchlistCount: 67 },
  { id: 'a3', title: 'Renaissance Oil Painting — "Dawn"', category: 'Fine Art', description: 'A magnificent Renaissance-style oil painting depicting dawn breaking over a mythological scene. Attributed to the school of a renowned master.', sellerId: 'u5', sellerName: 'Marcus Reid', condition: 'Good', basePrice: 25000, currentBid: 34000, bidIncrement: 1000, startTime: days(-5), endTime: hours(72), status: 'active', images: [artImg], totalBids: 12, watchlistCount: 134 },
  { id: 'a4', title: '1965 Shelby Cobra 427', category: 'Vehicles', description: 'Iconic American muscle — a fully restored 1965 Shelby Cobra 427 in racing blue with white stripes. Numbers matching, documented history.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'Restored', basePrice: 95000, currentBid: 142000, bidIncrement: 5000, startTime: days(-3), endTime: days(5), status: 'active', images: [vehicleImg], totalBids: 8, watchlistCount: 203 },
  { id: 'a5', title: 'Louis XV Writing Desk', category: 'Furniture', description: 'An exceptional Louis XV period writing desk with ornate marquetry, gilt-bronze mounts, and original leather top.', sellerId: 'u5', sellerName: 'Marcus Reid', condition: 'Very Good', basePrice: 15000, currentBid: 19800, bidIncrement: 500, startTime: days(-1), endTime: hours(6), status: 'ending-soon', images: [furnitureImg], totalBids: 14, watchlistCount: 45 },
  { id: 'a6', title: 'Bang & Olufsen Beolab 90', category: 'Electronics', description: 'The pinnacle of acoustic engineering — Bang & Olufsen Beolab 90 speakers. Like new condition with all accessories.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'Like New', basePrice: 40000, currentBid: 52000, bidIncrement: 2000, startTime: days(-4), endTime: hours(96), status: 'active', images: [electronicsImg], totalBids: 6, watchlistCount: 78 },
  { id: 'a7', title: 'Hermès Birkin 30 — Gold Togo', category: 'Fashion', description: 'The most coveted handbag in the world. Hermès Birkin 30 in Gold Togo leather with gold hardware. Stamp Y, full set.', sellerId: 'u5', sellerName: 'Marcus Reid', condition: 'Excellent', basePrice: 18000, currentBid: 26500, bidIncrement: 500, startTime: days(-2), endTime: hours(36), status: 'active', images: [fashionImg], totalBids: 32, watchlistCount: 156 },
  { id: 'a8', title: 'Château Margaux 1990 (Case of 12)', category: 'Wine', description: 'A full case of twelve bottles of Château Margaux 1990, stored in optimal conditions. Robert Parker 100 points.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'Perfect Storage', basePrice: 6000, currentBid: 9200, bidIncrement: 200, startTime: days(-1), endTime: hours(0.5), status: 'ending-soon', images: [wineImg], totalBids: 28, watchlistCount: 92 },
  { id: 'a9', title: 'First Edition — Pride and Prejudice', category: 'Books', description: 'An extraordinarily rare first edition of Jane Austen\'s Pride and Prejudice, 1813. Three volumes, original boards.', sellerId: 'u5', sellerName: 'Marcus Reid', condition: 'Fair', basePrice: 100000, currentBid: 145000, bidIncrement: 5000, startTime: days(-7), endTime: days(2), status: 'active', images: [booksImg], totalBids: 5, watchlistCount: 312 },
  { id: 'a10', title: 'Contemporary Abstract — "Nebula"', category: 'Fine Art', description: 'A striking contemporary abstract piece by an emerging artist. Acrylic on canvas, 120x180cm. Gallery provenance.', sellerId: 'u2', sellerName: 'James Whitmore', condition: 'New', basePrice: 3500, currentBid: 0, bidIncrement: 100, startTime: days(3), endTime: days(10), status: 'upcoming', images: [artImg], totalBids: 0, watchlistCount: 23 },
];

export const mockBids: Bid[] = [
  { id: 'b1', auctionId: 'a1', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 18500, timestamp: hours(-1) },
  { id: 'b2', auctionId: 'a1', bidderId: 'u4', bidderName: 'Isabella Chen', amount: 18000, timestamp: hours(-3) },
  { id: 'b3', auctionId: 'a1', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 17500, timestamp: hours(-5) },
  { id: 'b4', auctionId: 'a1', bidderId: 'u4', bidderName: 'Isabella Chen', amount: 16000, timestamp: hours(-8) },
  { id: 'b5', auctionId: 'a1', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 14500, timestamp: hours(-12) },
  { id: 'b6', auctionId: 'a2', bidderId: 'u4', bidderName: 'Isabella Chen', amount: 12200, timestamp: hours(-2) },
  { id: 'b7', auctionId: 'a2', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 11500, timestamp: hours(-6) },
  { id: 'b8', auctionId: 'a3', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 34000, timestamp: hours(-4) },
  { id: 'b9', auctionId: 'a5', bidderId: 'u4', bidderName: 'Isabella Chen', amount: 19800, timestamp: hours(-1) },
  { id: 'b10', auctionId: 'a7', bidderId: 'u1', bidderName: 'Sophia Laurent', amount: 26500, timestamp: hours(-0.5) },
];

export const mockTestimonials: Testimonial[] = [
  { id: 't1', name: 'Eleanor Voss', role: 'Collector', avatar: '👩‍🎨', rating: 5, quote: 'BidSmart transformed how I collect rare art pieces. The platform is elegant, trustworthy, and every auction feels like a curated experience.' },
  { id: 't2', name: 'David Harrington', role: 'Dealer', avatar: '🧑‍💼', rating: 5, quote: 'As a dealer, I\'ve tried many platforms. BidSmart\'s seller tools and transparent bidding make it my go-to marketplace.' },
  { id: 't3', name: 'Amara Okafor', role: 'First-time Buyer', avatar: '👩', rating: 4, quote: 'I was nervous about online auctions, but BidSmart made it incredibly easy. Won a beautiful vintage watch on my third bid!' },
];

export const categories = [
  { name: 'Watches & Jewelry', icon: React.createElement(MdOutlineWatch), count: 234 },
  { name: 'Fine Art', icon: React.createElement(MdOutlineColorLens), count: 189 },
  { name: 'Electronics', icon: React.createElement(MdOutlineLaptop), count: 156 },
  { name: 'Collectibles', icon: React.createElement(MdOutlineMuseum), count: 142 },
  { name: 'Furniture', icon: React.createElement(MdOutlineChair), count: 98 },
  { name: 'Fashion', icon: React.createElement(MdOutlineShoppingBag), count: 267 },
  { name: 'Real Estate', icon: React.createElement(MdOutlineHome), count: 34 },
  { name: 'Vehicles', icon: React.createElement(MdOutlineDirectionsCar), count: 67 },
  { name: 'Books', icon: React.createElement(MdOutlineMenuBook), count: 123 },
  { name: 'Wine', icon: React.createElement(MdOutlineWineBar), count: 89 },
];
