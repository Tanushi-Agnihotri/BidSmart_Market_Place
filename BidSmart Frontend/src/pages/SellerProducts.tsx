import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineAdd as Plus, MdOutlineSearch as Search, MdOutlineEdit as Edit, MdOutlineDelete as Trash2, MdOutlineVisibility as Eye, MdOutlineMoreHoriz as MoreHorizontal, MdOutlineInventory2 as Package, MdOutlineFilterList as Filter } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">My Products</h1>
            <p className="text-sm text-muted-foreground mt-1">{myProducts.length} listings total</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Active', value: stats.active, color: 'text-success' },
            { label: 'Ending Soon', value: stats.ending, color: 'text-warning' },
            { label: 'Closed', value: stats.closed, color: 'text-muted-foreground' },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={cn("font-mono text-2xl font-bold", s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="flex flex-col sm:flex-row gap-3 p-4">
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
          </CardContent>
        </Card>

        {/* Products table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No products found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableRow key={product.id} className="group">
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
          </CardContent>
        </Card>
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
