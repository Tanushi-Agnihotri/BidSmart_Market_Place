import { useState, useMemo, useEffect } from 'react';
import { MdOutlinePeople as Users, MdOutlineGavel as Gavel, MdOutlineCurrencyRupee as RupeeSign, MdOutlineTrendingUp as TrendingUp, MdOutlineShield as Shield, MdOutlineBlock as Ban, MdOutlineCheckCircle as CheckCircle2, MdOutlineSearch as Search, MdOutlineMoreHoriz as MoreHorizontal } from 'react-icons/md';
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
import { adminApi, type ApiAdminUser, type ApiDashboardStats } from '@/lib/apiService';

const revenueData = [
  { month: 'Sep', revenue: 32000, fees: 3200 },
  { month: 'Oct', revenue: 41000, fees: 4100 },
  { month: 'Nov', revenue: 56000, fees: 5600 },
  { month: 'Dec', revenue: 48000, fees: 4800 },
  { month: 'Jan', revenue: 62000, fees: 6200 },
  { month: 'Feb', revenue: 54000, fees: 5400 },
  { month: 'Mar', revenue: 71000, fees: 7100 },
];

const categoryData = [
  { name: 'Watches', value: 28 },
  { name: 'Art', value: 22 },
  { name: 'Vehicles', value: 15 },
  { name: 'Fashion', value: 18 },
  { name: 'Other', value: 17 },
];

const COLORS = ['hsl(42,50%,54%)', 'hsl(200,60%,50%)', 'hsl(150,50%,45%)', 'hsl(280,50%,55%)', 'hsl(0,0%,45%)'];

const bidsPerDay = [
  { day: 'Mon', bids: 42 },
  { day: 'Tue', bids: 58 },
  { day: 'Wed', bids: 35 },
  { day: 'Thu', bids: 67 },
  { day: 'Fri', bids: 89 },
  { day: 'Sat', bids: 74 },
  { day: 'Sun', bids: 51 },
];

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

  useEffect(() => {
    if (!authToken) return;
    refreshAuctions();
    adminApi.getStats().then(setApiStats).catch(() => {});
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
  }, [authToken, refreshAuctions]);

  const allUsers = apiUsers.length > 0 ? apiUsers : mockUsers;

  const totalUsers = apiStats?.totalUsers ?? allUsers.length;
  const activeAuctions = apiStats?.activeAuctions ?? auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length;
  const totalRevenue = apiStats?.totalRevenue ?? revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalBids = apiStats?.totalBids ?? bids.length;

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
    <div className="min-h-screen pt-24 pb-20 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" /> Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={Users} label="Total Users" value={String(totalUsers)} />
          <StatsCard icon={Gavel} label="Active Auctions" value={String(activeAuctions)} />
          <StatsCard icon={RupeeSign} label="Total Revenue" value={`₹${(totalRevenue / 1000).toFixed(0)}k`} />
          <StatsCard icon={TrendingUp} label="Total Bids" value={String(totalBids)} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Revenue & Fees</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
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
                <Area type="monotone" dataKey="fees" stroke="hsl(200,60%,50%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Fees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Auctions by Category</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222,30%,12%)', border: '1px solid hsl(222,20%,20%)', borderRadius: 12, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {categoryData.map((c, i) => (
                <span key={c.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bids Per Day */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-10">
          <h2 className="font-display text-lg font-semibold mb-4">Bidding Activity (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bidsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,20%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
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
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-5 py-3 text-left">
                        <SortableHeader label="User" sortKey="name" currentSort={userSort.sortKey} currentDirection={userSort.sortDir} onSort={userSort.onSort} />
                      </th>
                      <th className="px-5 py-3 text-left font-medium">Role</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left">
                        <SortableHeader label="Joined" sortKey="joinDate" currentSort={userSort.sortKey} currentDirection={userSort.sortDir} onSort={userSort.onSort} />
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => (
                      <tr key={user.id} className={cn("transition-colors hover:bg-muted/50", i !== filteredUsers.length - 1 && "border-b border-border")}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{user.avatar}</span>
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
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
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
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-5 py-3 text-left font-medium">Auction</th>
                      <th className="px-5 py-3 text-left font-medium">Seller</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-right">
                        <SortableHeader label="Current Bid" sortKey="currentBid" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                      <th className="px-5 py-3 text-right">
                        <SortableHeader label="Bids" sortKey="totalBids" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                      <th className="px-5 py-3 text-right">
                        <SortableHeader label="Watchers" sortKey="watchers" currentSort={auctionSort.sortKey} currentDirection={auctionSort.sortDir} onSort={auctionSort.onSort} className="justify-end" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuctions.map((auction, i) => (
                      <tr key={auction.id} className={cn("transition-colors hover:bg-muted/50", i !== filteredAuctions.length - 1 && "border-b border-border")}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
