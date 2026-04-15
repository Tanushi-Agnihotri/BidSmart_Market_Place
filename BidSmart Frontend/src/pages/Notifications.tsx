import { useState, useEffect } from 'react';
import { MdOutlineNotifications as Bell, MdOutlineCheck as Check, MdOutlineDoneAll as CheckCheck, MdOutlineDelete as Trash2, MdOutlineGavel as Gavel, MdOutlineErrorOutline as AlertCircle, MdOutlineSettings as Settings, MdOutlineFilterList as Filter } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { notificationApi, type ApiNotification } from '@/lib/apiService';

interface LocalNotification {
  id: string;
  type: 'bid' | 'auction' | 'system';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const generateNotifications = (role: string): LocalNotification[] => {
  const now = Date.now();
  const h = (n: number) => new Date(now - n * 3600000).toISOString();

  const base: LocalNotification[] = [
    { id: 'n1', type: 'system', title: 'Welcome to BidSmart', body: 'Your account is ready. Explore live auctions and start bidding today!', timestamp: h(168), read: true },
    { id: 'n2', type: 'system', title: 'Security Alert', body: 'A new login was detected from Chrome on macOS. If this wasn\'t you, please change your password.', timestamp: h(48), read: true },
  ];

  if (role === 'buyer') return [
    { id: 'n3', type: 'bid', title: 'Outbid on Rolex Submariner', body: 'Someone placed a higher bid of $18,500. Place a new bid to stay in the lead.', timestamp: h(0.5), read: false },
    { id: 'n4', type: 'bid', title: 'You\'re winning!', body: 'You\'re the highest bidder on "Hermès Birkin 30" at $26,500.', timestamp: h(1), read: false },
    { id: 'n5', type: 'auction', title: 'Auction Ending Soon', body: '"Art Deco Diamond Necklace" ends in less than 18 hours. Don\'t miss out!', timestamp: h(2), read: false },
    { id: 'n6', type: 'auction', title: 'New Auction in Your Watchlist', body: '"Contemporary Abstract — Nebula" has been listed. Starting at $3,500.', timestamp: h(6), read: true },
    { id: 'n7', type: 'bid', title: 'Bid Confirmed', body: 'Your bid of $34,000 on "Renaissance Oil Painting" has been placed successfully.', timestamp: h(12), read: true },
    ...base,
  ];

  if (role === 'seller') return [
    { id: 'n8', type: 'bid', title: 'New Bid Received', body: 'A bid of $18,500 was placed on "Vintage Rolex Submariner 1968".', timestamp: h(1), read: false },
    { id: 'n9', type: 'auction', title: 'Auction Performance', body: '"Shelby Cobra 427" has 8 bids and 203 watchers. Strong interest!', timestamp: h(3), read: false },
    { id: 'n10', type: 'bid', title: 'New Bid Received', body: 'A bid of $52,000 was placed on "Bang & Olufsen Beolab 90".', timestamp: h(6), read: true },
    { id: 'n11', type: 'auction', title: 'Listing Approved', body: 'Your listing "Château Margaux 1990" is now live and accepting bids.', timestamp: h(24), read: true },
    ...base,
  ];

  if (role === 'admin') return [
    { id: 'n12', type: 'system', title: 'User Flagged', body: 'User "Marcus Reid" has been flagged for review due to suspicious activity.', timestamp: h(1), read: false },
    { id: 'n13', type: 'auction', title: 'High-Value Auction', body: '"First Edition — Pride and Prejudice" has exceeded $145,000. Manual review recommended.', timestamp: h(2), read: false },
    { id: 'n14', type: 'system', title: 'Platform Report', body: 'Weekly analytics report is ready. Revenue up 12% week-over-week.', timestamp: h(12), read: true },
    ...base,
  ];

  return base;
};

function apiToLocal(n: ApiNotification): LocalNotification {
  return {
    id: n.id,
    type: n.type.toLowerCase() as 'bid' | 'auction' | 'system',
    title: n.title,
    body: n.body,
    timestamp: n.createdAt,
    read: n.read,
  };
}

const typeIcons = {
  bid: Gavel,
  auction: Bell,
  system: AlertCircle,
};

const typeColors = {
  bid: 'text-primary',
  auction: 'text-accent',
  system: 'text-muted-foreground',
};

const Notifications = () => {
  const { currentRole, authToken, notifications: globalNotifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshNotifications } = useApp();
  const [filter, setFilter] = useState<'all' | 'bid' | 'auction' | 'system'>('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  // Refresh notifications on page mount
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkRead = async (id: string) => {
    if (processingIds.has(id)) return; // prevent duplicate clicks
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await markNotificationRead(id);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = filter === 'all' ? globalNotifications : globalNotifications.filter(n => n.type === filter);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (currentRole === 'guest') {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Sign in to view notifications</h2>
          <p className="text-muted-foreground text-base">Log in or register to receive bid alerts, auction updates, and more.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-base mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll} className="gap-1.5">
                <CheckCheck className="h-4 w-4" /> {markingAll ? 'Marking...' : 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bid">Bids</TabsTrigger>
            <TabsTrigger value="auction">Auctions</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications in this category.</p>
            </Card>
          ) : (
            filtered.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <Card
                  key={n.id}
                  className={cn(
                    "group transition-all duration-200 hover:shadow-md cursor-pointer",
                    !n.read && "border-l-2 border-l-primary bg-primary/[0.03]"
                  )}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={cn("mt-0.5 shrink-0 rounded-xl p-2 bg-muted", typeColors[n.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("font-medium text-base", !n.read && "font-semibold")}>{n.title}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">{n.body}</p>
                      <span className="text-sm text-muted-foreground mt-1 block">{timeAgo(n.timestamp)}</span>
                    </div>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" title="Unread" />
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
