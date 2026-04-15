import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatsCard from '@/components/shared/StatsCard';
import SortableHeader, { useSortState } from '@/components/shared/SortableHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { MdOutlineDownload as Download, MdOutlineDescription as FileText, MdOutlineTrendingUp as TrendingUp, MdOutlineCurrencyRupee as RupeeSign, MdOutlineGroup as Users, MdOutlineGavel as Gavel, MdOutlineCalendarToday as Calendar, MdOutlineSearch as Search } from 'react-icons/md';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(42, 50%, 54%)',
  'hsl(217, 89%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(0, 72%, 51%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(190, 70%, 50%)',
];

const Reports = () => {
  const { auctions, bids } = useApp();
  const [period, setPeriod] = useState('30d');
  const [tableSearch, setTableSearch] = useState('');
  const debouncedTableSearch = useDebounce(tableSearch, 300);
  const { sortKey, sortDir, onSort, sortItems } = useSortState();

  const categoryData = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    auctions.forEach(a => {
      if (!map[a.category]) map[a.category] = { count: 0, revenue: 0 };
      map[a.category].count++;
      map[a.category].revenue += a.currentBid;
    });
    return Object.entries(map).map(([name, d]) => ({ name: name.split(' ')[0], fullName: name, ...d }));
  }, [auctions]);

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      revenue: Math.round(20000 + Math.random() * 80000 + i * 5000),
      auctions: Math.round(10 + Math.random() * 30 + i * 2),
    }));
  }, []);

  const bidActivityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      bids: Math.round(20 + Math.random() * 80),
      users: Math.round(5 + Math.random() * 25),
    }));
  }, []);

  const totalRevenue = auctions.reduce((s, a) => s + a.currentBid, 0);
  const totalBids = bids.length;
  const avgBidAmount = totalBids ? Math.round(totalRevenue / totalBids) : 0;
  const activeAuctions = auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length;

  const auctionTableData = useMemo(() => {
    const q = debouncedTableSearch.toLowerCase();
    let items = auctions
      .filter(a => a.status !== 'upcoming')
      .map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        seller: a.sellerName,
        currentBid: a.currentBid,
        totalBids: a.totalBids,
        status: a.status,
        watchers: a.watchlistCount,
        endTime: a.endTime,
      }));

    if (q) {
      items = items.filter(r =>
        r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.seller.toLowerCase().includes(q)
      );
    }

    return sortItems(items, (item, key) => {
      switch (key) {
        case 'currentBid': return item.currentBid;
        case 'totalBids': return item.totalBids;
        case 'watchers': return item.watchers;
        case 'endTime': return new Date(item.endTime).getTime();
        default: return item.title;
      }
    });
  }, [auctions, debouncedTableSearch, sortKey, sortDir]);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename}.csv downloaded`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
        <p className="mb-1 font-semibold text-foreground">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">
            {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
              ? `₹${p.value.toLocaleString()}`
              : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="mt-1 text-muted-foreground">Platform performance at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] border-border bg-card">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportCSV(auctionTableData as any, 'auction-report')}>
              <Download className="mr-1.5 h-4 w-4" /> Export All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={RupeeSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
          <StatsCard icon={Gavel} label="Total Bids" value={totalBids.toString()} />
          <StatsCard icon={TrendingUp} label="Avg Bid" value={`₹${avgBidAmount.toLocaleString()}`} />
          <StatsCard icon={Users} label="Active Auctions" value={activeAuctions.toString()} />
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">Revenue Trend</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => exportCSV(revenueData as any, 'revenue-data')}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 25%, 18%)" />
                        <XAxis dataKey="month" stroke="hsl(220, 15%, 55%)" fontSize={12} />
                        <YAxis stroke="hsl(220, 15%, 55%)" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(42, 50%, 54%)" strokeWidth={2} dot={{ fill: 'hsl(42, 50%, 54%)', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">By Category</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => exportCSV(categoryData.map(c => ({ category: c.fullName, auctions: c.count, revenue: c.revenue })) as any, 'category-data')}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auctions" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">Auctions by Category</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV(categoryData.map(c => ({ category: c.fullName, count: c.count, revenue: c.revenue })) as any, 'auctions-by-category')}>
                  <FileText className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 25%, 18%)" />
                      <XAxis dataKey="name" stroke="hsl(220, 15%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(220, 15%, 55%)" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="count" name="Auctions" fill="hsl(42, 50%, 54%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue" fill="hsl(217, 89%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Data Table with search & sort */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">Auction Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search auctions..."
                      value={tableSearch}
                      onChange={e => setTableSearch(e.target.value)}
                      className="pl-9 h-9 w-[200px]"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(auctionTableData as any, 'auction-performance')}>
                    <Download className="mr-1.5 h-4 w-4" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Title</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Seller</TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Current Bid" sortKey="currentBid" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} className="justify-end" />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Bids" sortKey="totalBids" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} className="justify-end" />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Watchers" sortKey="watchers" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} className="justify-end" />
                      </TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auctionTableData.map(row => (
                      <TableRow key={row.id} className="border-border">
                        <TableCell className="max-w-[200px] truncate font-medium text-foreground">{row.title}</TableCell>
                        <TableCell className="text-muted-foreground">{row.category}</TableCell>
                        <TableCell className="text-muted-foreground">{row.seller}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">₹{row.currentBid.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">{row.totalBids}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">{row.watchers}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-sm font-semibold ${row.status === 'active' ? 'bg-success/15 text-success' :
                              row.status === 'ending-soon' ? 'bg-warning/15 text-warning' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">Weekly Bid Activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV(bidActivityData as any, 'bid-activity')}>
                  <FileText className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bidActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 25%, 18%)" />
                      <XAxis dataKey="day" stroke="hsl(220, 15%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(220, 15%, 55%)" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="bids" name="Bids" fill="hsl(42, 50%, 54%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="users" name="Active Users" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Reports;
