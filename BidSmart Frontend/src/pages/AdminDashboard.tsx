import { useState, useMemo, useEffect } from 'react';
import { MdOutlinePeople as Users, MdOutlineGavel as Gavel, MdOutlineCurrencyRupee as RupeeSign, MdOutlineTrendingUp as TrendingUp, MdOutlineShield as Shield, MdOutlineBlock as Ban, MdOutlineCheckCircle as CheckCircle2, MdOutlineSearch as Search, MdOutlineMoreHoriz as MoreHorizontal, MdOutlineDelete as Trash, MdOutlineVerifiedUser as VerifiedIcon, MdOutlineStore as Store, MdOutlineClose as XIcon } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import SortableHeader, { useSortState } from '@/components/shared/SortableHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { mockUsers, type User } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { adminApi, type ApiAdminUser, type ApiDashboardStats, type ApiAdminSeller, type ApiAuction } from '@/lib/apiService';
import { toast } from '@/hooks/use-toast';

const COLORS = ['hsl(42,50%,54%)', 'hsl(200,60%,50%)', 'hsl(150,50%,45%)', 'hsl(280,50%,55%)', 'hsl(0,0%,45%)'];

const AdminDashboard = () => {
  const { auctions, bids, authToken, refreshAuctions } = useApp();
  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const [auctionSearch, setAuctionSearch] = useState('');
  const debouncedAuctionSearch = useDebounce(auctionSearch, 300);

  const userSort = useSortState();
  const auctionSort = useSortState();

  // API data
  const [apiStats, setApiStats] = useState<ApiDashboardStats | null>(null);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [chartData, setChartData] = useState<{
    monthlyRevenue: { month: string; revenue: number }[];
    dailyBids: { day: string; bids: number }[];
    categoryData: { name: string; value: number }[];
  }>({ monthlyRevenue: [], dailyBids: [], categoryData: [] });

  // Verification queues
  const [pendingSellers, setPendingSellers] = useState<ApiAdminSeller[]>([]);
  const [pendingAuctions, setPendingAuctions] = useState<ApiAuction[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState<
    | { kind: 'seller'; id: string; name: string }
    | { kind: 'auction'; id: string; name: string }
    | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPendingSellers = () => {
    adminApi.getSellers('PENDING').then(setPendingSellers).catch(() => {});
  };
  const loadPendingAuctions = () => {
    adminApi.getAuctionsByVerification('PENDING').then(setPendingAuctions).catch(() => {});
  };

  useEffect(() => {
    if (!authToken) return;
    refreshAuctions();
    adminApi.getStats().then(setApiStats).catch(() => {});
    adminApi.getCharts().then(setChartData).catch(() => {});
    adminApi.getUsers().then(users => {
      setApiUsers(users.map(u => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role.toLowerCase() as User['role'],
        status: u.status.toLowerCase() as User['status'],
        avatar: u.role === 'ADMIN' ? '🛡️' : u.role === 'SELLER' ? '🏪' : '🛒',
        joinDate: u.createdAt,
        stats: {},
      })));
    }).catch(() => {});
    loadPendingSellers();
    loadPendingAuctions();
  }, [authToken, refreshAuctions]);

  const handleApproveSeller = async (id: string) => {
    setVerifying(true);
    try {
      await adminApi.verifySeller(id, 'VERIFIED');
      setPendingSellers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Seller verified' });
    } catch {
      toast({ title: 'Verification failed', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleApproveAuction = async (id: string) => {
    setVerifying(true);
    try {
      await adminApi.verifyAuction(id, 'VERIFIED');
      setPendingAuctions(prev => prev.filter(a => a.id !== id));
      await refreshAuctions();
      toast({ title: 'Auction verified' });
    } catch {
      toast({ title: 'Verification failed', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionTarget) return;
    setVerifying(true);
    try {
      if (rejectionTarget.kind === 'seller') {
        await adminApi.verifySeller(rejectionTarget.id, 'REJECTED', rejectionReason || undefined);
        setPendingSellers(prev => prev.filter(s => s.id !== rejectionTarget.id));
        toast({ title: 'Seller rejected' });
      } else {
        await adminApi.verifyAuction(rejectionTarget.id, 'REJECTED', rejectionReason || undefined);
        setPendingAuctions(prev => prev.filter(a => a.id !== rejectionTarget.id));
        toast({ title: 'Auction rejected' });
      }
    } catch {
      toast({ title: 'Rejection failed', variant: 'destructive' });
    } finally {
      setVerifying(false);
      setRejectionTarget(null);
      setRejectionReason('');
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'auction'; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUser = async (userId: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteUser(userId);
      setApiUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: 'User deleted', description: 'User and all their data removed.' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteAuction(auctionId);
      await refreshAuctions();
      toast({ title: 'Auction deleted', description: 'Auction and all bids removed.' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setApiUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus === 'ACTIVE' ? 'active' : 'suspended' } : u));
      toast({ title: `User ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'}` });
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    }
  };

  const allUsers = apiUsers.length > 0 ? apiUsers : mockUsers;

  const totalUsers = apiStats?.totalUsers ?? allUsers.length;
  const activeAuctions = apiStats?.activeAuctions ?? auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length;
  const totalRevenue = apiStats?.totalRevenue ?? 0;
  const totalBids = apiStats?.totalBids ?? bids.length;

  // Pad monthly revenue to always show last 6 months (fill missing with 0)
  const paddedMonthlyRevenue = useMemo(() => {
    const now = new Date();
    const months: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const found = chartData.monthlyRevenue.find(m => m.month === label);
      months.push({ month: label, revenue: Number(found?.revenue ?? 0) });
    }
    return months;
  }, [chartData.monthlyRevenue]);

  // Pad daily bids to always show Mon-Sun (fill missing with 0)
  const paddedDailyBids = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const found = chartData.dailyBids.find(d => d.day === day);
      return { day, bids: Number(found?.bids ?? 0) };
    });
  }, [chartData.dailyBids]);

  const filteredUsers = useMemo(() => {
    const q = debouncedUserSearch.toLowerCase();
    let items = allUsers.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    return userSort.sortItems(items, (item, key) => {
      switch (key) {
        case 'name': return item.name;
        case 'joinDate': return new Date(item.joinDate).getTime();
        default: return item.name;
      }
    });
  }, [allUsers, debouncedUserSearch, userSort.sortKey, userSort.sortDir]);

  const filteredAuctions = useMemo(() => {
    const q = debouncedAuctionSearch.toLowerCase();
    let items = auctions.filter(a =>
      a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.sellerName.toLowerCase().includes(q)
    );
    return auctionSort.sortItems(items, (item, key) => {
      switch (key) {
        case 'currentBid': return item.currentBid;
        case 'totalBids': return item.totalBids;
        case 'endTime': return new Date(item.endTime).getTime();
        case 'watchers': return item.watchlistCount;
        default: return item.title;
      }
    });
  }, [auctions, debouncedAuctionSearch, auctionSort.sortKey, auctionSort.sortDir]);

  const roleColors: Record<string, string> = {
    buyer: 'bg-accent/20 text-accent',
    seller: 'bg-primary/20 text-primary',
    admin: 'bg-success/20 text-success',
  };

  const statusColors: Record<string, string> = {
    active: 'text-success',
    suspended: 'text-destructive',
  };

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      <div className="container mx-auto px-6 lg:px-10">

        {/* Hero Header */}
        <div className="animate-float-up mb-8">
          <div className="rounded-3xl border border-border bg-card shadow-card p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Admin Zone
                  </span>
                  <h1 className="font-display text-4xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Platform overview and management tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-float-up" style={{ animationDelay: '100ms' }}>
            <StatsCard icon={Users} label="Total Users" value={String(totalUsers)} />
          </div>
          <div className="animate-float-up" style={{ animationDelay: '200ms' }}>
            <StatsCard icon={Gavel} label="Active Auctions" value={String(activeAuctions)} />
          </div>
          <div className="animate-float-up" style={{ animationDelay: '300ms' }}>
            <StatsCard icon={RupeeSign} label="Total Revenue" value={`₹${(totalRevenue / 1000).toFixed(0)}k`} />
          </div>
          <div className="animate-float-up" style={{ animationDelay: '400ms' }}>
            <StatsCard icon={TrendingUp} label="Total Bids" value={String(totalBids)} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Revenue & Fees</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={paddedMonthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(42,50%,54%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(42,50%,54%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,20%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222,30%,12%)', border: '1px solid hsl(222,20%,20%)', borderRadius: 12, fontSize: 13 }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(42,50%,54%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Auctions by Category</h2>
            {chartData.categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-center">
                <div className="h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center mb-2">
                  <Gavel className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No active auctions yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={chartData.categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={chartData.categoryData.length > 1 ? 3 : 0} dataKey="value">
                      {chartData.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(222,30%,12%)', border: '1px solid hsl(222,20%,20%)', borderRadius: 12, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {chartData.categoryData.map((c, i) => (
                    <span key={c.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bids Per Day */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-10">
          <h2 className="font-display text-lg font-semibold mb-4">Bidding Activity (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paddedDailyBids}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,20%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(222,30%,12%)', border: '1px solid hsl(222,20%,20%)', borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="bids" fill="hsl(42,50%,54%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs: Users & Auctions */}
        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5 mr-1.5" /> User Management
            </TabsTrigger>
            <TabsTrigger value="auctions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Gavel className="h-3.5 w-3.5 mr-1.5" /> Auction Monitoring
            </TabsTrigger>
            <TabsTrigger value="verify-sellers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store className="h-3.5 w-3.5 mr-1.5" /> Pending Sellers
              {pendingSellers.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold">{pendingSellers.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="verify-auctions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <VerifiedIcon className="h-3.5 w-3.5 mr-1.5" /> Pending Auctions
              {pendingAuctions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold">{pendingAuctions.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <SortableHeader label="User" sortKey="name" currentSort={userSort.sortKey} currentDirection={userSort.sortDir} onSort={userSort.onSort} />
                      </th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Role</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <SortableHeader label="Joined" sortKey="joinDate" currentSort={userSort.sortKey} currentDirection={userSort.sortDir} onSort={userSort.onSort} />
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => (
                      <tr key={user.id} className={cn("transition-colors hover:bg-muted/40", i !== filteredUsers.length - 1 && "border-b border-border")}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold uppercase", roleColors[user.role] || 'bg-muted text-muted-foreground')}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("flex items-center gap-1.5 text-sm font-semibold", statusColors[user.status])}>
                            {user.status === 'active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-sm">
                          {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {user.role !== 'admin' && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSuspendUser(user.id, user.status)}
                                className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                                  user.status === 'active'
                                    ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                                    : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                )}
                              >
                                {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                              <button
                                onClick={() => setConfirmDelete({ type: 'user', id: user.id, name: user.name })}
                                className="rounded-lg p-1.5 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="auctions">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search auctions..."
                    value={auctionSearch}
                    onChange={e => setAuctionSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Auction</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Seller</th>
                      <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                        <SortableHeader label="Current Bid" sortKey="currentBid" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                        <SortableHeader label="Bids" sortKey="totalBids" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                      <th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                        <SortableHeader label="Watchers" sortKey="watchers" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuctions.map((auction, i) => (
                      <tr key={auction.id} className={cn("transition-colors hover:bg-muted/40", i !== filteredAuctions.length - 1 && "border-b border-border")}>
                        <td className="px-5 py-3">
                          <Link to={`/auctions/${auction.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <img src={auction.images[0]} alt={auction.title} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[220px]">{auction.title}</p>
                              <p className="text-sm text-muted-foreground">{auction.category}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{auction.sellerName}</td>
                        <td className="px-5 py-3"><StatusBadge status={auction.status} /></td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-primary">
                          {auction.currentBid > 0 ? `₹${auction.currentBid.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-right font-mono">{auction.totalBids}</td>
                        <td className="px-5 py-3 text-right font-mono">{auction.watchlistCount}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setConfirmDelete({ type: 'auction', id: auction.id, name: auction.title })}
                            className="rounded-lg p-1.5 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify-sellers">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {pendingSellers.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <VerifiedIcon className="mx-auto mb-2 h-8 w-8 opacity-60" />
                  No pending seller applications
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingSellers.map(s => (
                    <div key={s.id} className="p-5 flex flex-col lg:flex-row gap-4 lg:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                            {s.userFullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{s.storeName}</p>
                            <p className="text-sm text-muted-foreground truncate">{s.userFullName} · {s.userEmail}</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm ml-13">
                          <div><span className="text-muted-foreground">Category:</span> {s.businessCategory}</div>
                          <div><span className="text-muted-foreground">Legal name:</span> {s.legalName}</div>
                          <div className="sm:col-span-2">
                            <a
                              href={s.idDocumentUrl.startsWith('http') ? s.idDocumentUrl : s.idDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View ID document →
                            </a>
                          </div>
                          {s.description && (
                            <div className="sm:col-span-2 text-muted-foreground text-xs mt-1 line-clamp-2">{s.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveSeller(s.id)}
                          disabled={verifying}
                          className="rounded-xl bg-green-500/15 text-green-600 hover:bg-green-500/25 px-3 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectionTarget({ kind: 'seller', id: s.id, name: s.storeName })}
                          disabled={verifying}
                          className="rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XIcon className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify-auctions">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {pendingAuctions.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <VerifiedIcon className="mx-auto mb-2 h-8 w-8 opacity-60" />
                  No auctions awaiting verification
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingAuctions.map(a => (
                    <div key={a.id} className="p-5 flex flex-col lg:flex-row gap-4 lg:items-center">
                      <div className="flex-1 min-w-0 flex gap-3">
                        {a.images?.[0] && (
                          <img
                            src={a.images[0].startsWith('/') ? `${a.images[0]}` : a.images[0]}
                            alt={a.title}
                            className="h-16 w-16 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{a.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {a.category} · {a.sellerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Base ₹{a.basePrice.toLocaleString()} · {a.condition}
                          </p>
                          {a.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveAuction(a.id)}
                          disabled={verifying}
                          className="rounded-xl bg-green-500/15 text-green-600 hover:bg-green-500/25 px-3 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectionTarget({ kind: 'auction', id: a.id, name: a.title })}
                          disabled={verifying}
                          className="rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XIcon className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        {rejectionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <XIcon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-semibold">Reject {rejectionTarget.kind}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                Rejecting <span className="font-semibold text-foreground">"{rejectionTarget.name}"</span>. An optional reason helps the {rejectionTarget.kind === 'seller' ? 'seller' : 'seller'} understand next steps.
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectionTarget(null); setRejectionReason(''); }}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={verifying}
                  className="flex-1 rounded-xl bg-destructive py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {verifying ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <Trash className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-semibold">Confirm Delete</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-5">
                Are you sure you want to permanently delete <span className="font-semibold text-foreground">"{confirmDelete.name}"</span>?
                {confirmDelete.type === 'user' && ' All their auctions, bids and data will be removed.'}
                {confirmDelete.type === 'auction' && ' All bids on this auction will also be deleted.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete.type === 'user' ? handleDeleteUser(confirmDelete.id) : handleDeleteAuction(confirmDelete.id)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-destructive py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
