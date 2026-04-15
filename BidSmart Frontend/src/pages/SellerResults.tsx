import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MdOutlineEmojiEvents as Trophy,
  MdOutlineSearch as Search,
  MdOutlineCheckCircle as CheckCircle,
  MdOutlineCancel as XCircle,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlineInventory2 as Package,
  MdOutlineTrendingUp as TrendingUp,
  MdOutlineVisibility as Eye,
  MdOutlineFilterList as Filter,
  MdOutlineArrowBack as ArrowLeft,
} from 'react-icons/md';
import SellerAccessGate from '@/components/shared/SellerAccessGate';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SortableHeader, { useSortState } from '@/components/shared/SortableHeader';
import { cn } from '@/lib/utils';

type Outcome = 'sold' | 'unsold';

const SellerResults = () => {
  const { currentUser, currentRole, auctions, bids } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | Outcome>('all');
  const { sortKey, sortDir, onSort, sortItems } = useSortState();

  // Build results: only closed auctions belonging to current seller
  const results = useMemo(() => {
    const closed = auctions.filter(
      a => a.sellerId === currentUser?.id && a.status === 'closed'
    );
    return closed.map(a => {
      const auctionBids = bids.filter(b => b.auctionId === a.id);
      const winningBid = auctionBids.reduce<typeof auctionBids[number] | null>(
        (top, b) => (!top || b.amount > top.amount ? b : top),
        null
      );
      const sold = !!winningBid && winningBid.amount >= a.basePrice;
      return {
        ...a,
        outcome: (sold ? 'sold' : 'unsold') as Outcome,
        finalPrice: sold ? winningBid!.amount : 0,
        winnerName: sold ? winningBid!.bidderName : null,
        bidCount: auctionBids.length,
      };
    });
  }, [auctions, bids, currentUser]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const items = results.filter(r => {
      const matchSearch =
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.winnerName?.toLowerCase().includes(q) ?? false);
      const matchOutcome = outcomeFilter === 'all' || r.outcome === outcomeFilter;
      return matchSearch && matchOutcome;
    });
    return sortItems(items, (item, key) => {
      switch (key) {
        case 'finalPrice': return item.finalPrice;
        case 'bids': return item.bidCount;
        case 'endTime': return new Date(item.endTime).getTime();
        default: return item.title;
      }
    });
  }, [results, debouncedSearch, outcomeFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = results.length;
    const sold = results.filter(r => r.outcome === 'sold').length;
    const unsold = total - sold;
    const revenue = results.reduce((sum, r) => sum + r.finalPrice, 0);
    const conversion = total === 0 ? 0 : Math.round((sold / total) * 100);
    return { total, sold, unsold, revenue, conversion };
  }, [results]);

  if (currentRole !== 'seller') {
    return (
      <SellerAccessGate
        feature="Auction Results"
        description="Auction Results is a seller-only view — outcomes, winners, final prices, and revenue from your closed listings."
      />
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold">Auction Results</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Outcomes of your closed auctions — winners, final prices, and revenue.
            </p>
          </div>
          <Button asChild>
            <Link to="/seller/products" className="gap-2">
              <Package className="h-4 w-4" /> All Products
            </Link>
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Total Closed</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-mono text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Sold</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="font-mono text-2xl font-bold text-success">{stats.sold}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Unsold</p>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-mono text-2xl font-bold text-muted-foreground">{stats.unsold}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <RupeeSign className="h-4 w-4 text-primary" />
            </div>
            <p className="font-mono text-2xl font-bold text-primary">₹{stats.revenue.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Conversion</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-mono text-2xl font-bold">{stats.conversion}%</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col sm:flex-row gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, category, or winner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={outcomeFilter} onValueChange={v => setOutcomeFilter(v as typeof outcomeFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="unsold">Unsold</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Results table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {results.length === 0
                    ? 'No closed auctions yet. Results will appear here once your auctions end.'
                    : 'No results match your filters.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Final Price" sortKey="finalPrice" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Bids" sortKey="bids" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead>
                        <SortableHeader label="Ended" sortKey="endTime" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(r => (
                      <TableRow key={r.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-border">
                              {r.images && r.images.length > 0 && r.images[0] ? (
                                <img src={r.images[0]} alt={r.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-base truncate max-w-[220px]">{r.title}</p>
                              <p className="text-sm text-muted-foreground">{r.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                              r.outcome === 'sold'
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {r.outcome === 'sold' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {r.outcome === 'sold' ? 'Sold' : 'Unsold'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {r.winnerName ? (
                            <span className="text-base text-foreground">{r.winnerName}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-base font-semibold">
                          {r.outcome === 'sold' ? (
                            <span className="text-primary">₹{r.finalPrice.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-base">{r.bidCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(r.endTime)}</TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/auctions/${r.id}`} aria-label="View auction">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerResults;
