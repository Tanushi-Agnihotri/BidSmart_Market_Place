import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineAdd as Plus, MdOutlineSearch as Search, MdOutlineEdit as Edit, MdOutlineDelete as Trash2, MdOutlineVisibility as Eye, MdOutlineMoreHoriz as MoreHorizontal, MdOutlineInventory2 as Package, MdOutlineFilterList as Filter } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CountdownTimer from '@/components/shared/CountdownTimer';
import StatusBadge from '@/components/shared/StatusBadge';
import SortableHeader, { useSortState } from '@/components/shared/SortableHeader';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import SellerAccessGate from '@/components/shared/SellerAccessGate';

const SellerProducts = () => {
  const { currentUser, currentRole, auctions, bids, deleteAuction } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { sortKey, sortDir, onSort, sortItems } = useSortState();

  const myProducts = useMemo(() => auctions.filter(a => a.sellerId === currentUser?.id), [auctions, currentUser]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let items = myProducts.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return sortItems(items, (item, key) => {
      switch (key) {
        case 'basePrice': return item.basePrice;
        case 'currentBid': return item.currentBid;
        case 'bids': return bids.filter(b => b.auctionId === item.id).length;
        case 'endTime': return new Date(item.endTime).getTime();
        default: return item.title;
      }
    });
  }, [myProducts, debouncedSearch, statusFilter, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: myProducts.length,
    active: myProducts.filter(a => a.status === 'active').length,
    ending: myProducts.filter(a => a.status === 'ending-soon').length,
    closed: myProducts.filter(a => a.status === 'closed').length,
  }), [myProducts]);

  if (currentRole !== 'seller') {
    return (
      <SellerAccessGate
        feature="My Products"
        description="My Products is where you manage all your listings — active, upcoming, and closed auctions — in one place."
      />
    );
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteAuction(deleteId);
    if (success) {
      toast.success('Product deleted successfully');
    } else {
      toast.error('Failed to delete product');
    }
    setDeleteId(null);
  };


  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

      <div className="relative container mx-auto px-4">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card mb-8">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 shadow-lg">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                    Seller Zone
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    My Products
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {myProducts.length} listing{myProducts.length !== 1 ? 's' : ''} total — manage, edit, and track all your auctions.
                  </p>
                </div>
              </div>
              <Link
                to="/seller/products/new"
                className="inline-flex items-center gap-2 rounded-xl gradient-gold px-6 py-3 text-base font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg shrink-0"
              >
                <Plus className="h-5 w-5" /> Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', accent: 'from-primary/30 to-primary/5' },
            { label: 'Active', value: stats.active, color: 'text-success', accent: 'from-success/30 to-success/5' },
            { label: 'Ending Soon', value: stats.ending, color: 'text-warning', accent: 'from-warning/30 to-warning/5' },
            { label: 'Closed', value: stats.closed, color: 'text-muted-foreground', accent: 'from-muted/50 to-muted/10' },
          ].map(s => (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className={`absolute inset-x-0 -top-px h-px bg-gradient-to-r ${s.accent}`} />
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <p className={cn("font-mono text-3xl font-bold mt-1", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card mb-6">
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products table */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="font-display text-xl font-semibold mb-1">No products found</p>
                <p className="text-sm text-muted-foreground mb-5">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/30">
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Base Price" sortKey="basePrice" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Current Bid" sortKey="currentBid" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead className="text-right">
                        <SortableHeader label="Bids" sortKey="bids" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead>
                        <SortableHeader label="Ends In" sortKey="endTime" currentSort={sortKey} currentDirection={sortDir} onSort={onSort} />
                      </TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(product => {
                      const productBids = bids.filter(b => b.auctionId === product.id).length;
                      return (
                        <TableRow key={product.id} className="group hover:bg-muted/40 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-border">
                                {product.images && product.images.length > 0 && product.images[0] ? (
                                  <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-base truncate max-w-[200px]">{product.title}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><StatusBadge status={product.status} /></TableCell>
                          <TableCell className="text-right font-mono text-base">₹{product.basePrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-base font-semibold text-primary">
                            {product.currentBid > 0 ? `₹${product.currentBid.toLocaleString()}` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base">{productBids}</TableCell>
                          <TableCell>
                            {product.status === 'closed' ? (
                              <span className="text-sm text-muted-foreground">Ended</span>
                            ) : (
                              <CountdownTimer endTime={product.endTime} />
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/auctions/${product.id}`} className="gap-2">
                                    <Eye className="h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/seller/products/${product.id}/edit`} className="gap-2">
                                    <Edit className="h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setDeleteId(product.id)}>
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerProducts;
