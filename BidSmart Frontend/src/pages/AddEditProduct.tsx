import { useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineArrowBack as ArrowLeft, MdOutlineCloudUpload as Upload, MdOutlineAddPhotoAlternate as ImagePlus, MdOutlineClose as X, MdOutlineSave as Save, MdOutlineVisibility as Eye, MdOutlineSync as Loader2, MdOutlineSchedule as Schedule, MdOutlinePlayArrow as PlayArrow, MdOutlineCalendarToday as CalendarIcon, MdOutlineAccessTime as ClockIcon, MdOutlineStar as Star, MdOutlineStarBorder as StarBorder } from 'react-icons/md';
import { useApp } from '@/context/AppContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/mockData';
import { toast } from 'sonner';
import { auctionApi, imageApi, ApiError } from '@/lib/apiService';
import { cn } from '@/lib/utils';
import SellerAccessGate from '@/components/shared/SellerAccessGate';

const conditions = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Restored'];
const presetDurations = [
  { label: '1 Hour', hours: 1 },
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours', hours: 12 },
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '5 Days', hours: 120 },
  { label: '7 Days', hours: 168 },
  { label: '10 Days', hours: 240 },
  { label: '14 Days', hours: 336 },
  { label: '30 Days', hours: 720 },
];

type PendingImage = {
  file: File;
  preview: string;
};

// Get min date string (today)
const getMinDate = () => new Date().toISOString().slice(0, 10);
// Get max date string (30 days from now)
const getMaxDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// Generate time slots in 30-minute intervals
const timeSlots: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    timeSlots.push({
      value: `${hh}:${mm}`,
      label: `${h12}:${mm} ${ampm}`,
    });
  }
}

const AddEditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole, currentUser, authToken, auctions, refreshAuctions } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existing = id ? auctions.find(a => a.id === id && a.sellerId === currentUser?.id) : null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [condition, setCondition] = useState(existing?.condition || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [basePrice, setBasePrice] = useState(existing?.basePrice?.toString() || '');
  const [bidIncrement, setBidIncrement] = useState(existing?.bidIncrement?.toString() || '');
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const [presetDuration, setPresetDuration] = useState('168');
  const [customDurationDays, setCustomDurationDays] = useState('');
  const [customDurationHours, setCustomDurationHours] = useState('');
  const [startMode, setStartMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDateStr, setScheduledDateStr] = useState('');
  const [scheduledTimeStr, setScheduledTimeStr] = useState('12:00');
  const [existingImages, setExistingImages] = useState<string[]>(existing?.images || []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0); // index in the combined (existing + pending) list
  const [uploadingImage, setUploadingImage] = useState(false);

  const totalImages = existingImages.length + pendingImages.length;

  if (currentRole !== 'seller') {
    return (
      <SellerAccessGate
        feature={id ? 'Edit Product' : 'List a Product'}
        description={id
          ? 'Editing a product listing is a seller-only action — you can only edit items you have listed.'
          : 'Listing a product is a seller-only action — set your base price, upload photos, and start receiving bids.'}
      />
    );
  }

  const [submitting, setSubmitting] = useState(false);

  const getDurationHours = (): number => {
    if (durationMode === 'preset') {
      return parseInt(presetDuration);
    }
    const days = parseInt(customDurationDays || '0');
    const hours = parseInt(customDurationHours || '0');
    return days * 24 + hours;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !condition || !basePrice || !bidIncrement) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const durationHours = getDurationHours();
    if (durationHours < 1) {
      toast.error('Auction duration must be at least 1 hour.');
      return;
    }
    if (durationHours > 720) {
      toast.error('Auction duration cannot exceed 30 days (720 hours).');
      return;
    }

    if (startMode === 'scheduled' && !scheduledDateStr) {
      toast.error('Please select a start date for the scheduled auction.');
      return;
    }

    if (startMode === 'scheduled') {
      const scheduled = new Date(`${scheduledDateStr}T${scheduledTimeStr}`);
      if (scheduled.getTime() <= Date.now()) {
        toast.error('Scheduled start time must be in the future.');
        return;
      }
    }

    if (!authToken) {
      toast.error('Please sign in with your account to list products. Demo mode does not support this.');
      return;
    }

    setSubmitting(true);
    try {
      let auctionId = id;

      if (isEdit && id) {
        await auctionApi.update(id, {
          title, category, description, condition,
          basePrice: parseFloat(basePrice),
          bidIncrement: parseFloat(bidIncrement),
        });
      } else {
        const createData: Parameters<typeof auctionApi.create>[0] = {
          title, category, description, condition,
          basePrice: parseFloat(basePrice),
          bidIncrement: parseFloat(bidIncrement),
          durationHours,
        };

        if (startMode === 'scheduled' && scheduledDateStr) {
          createData.scheduledStartTime = new Date(`${scheduledDateStr}T${scheduledTimeStr}`).toISOString();
        }

        const created = await auctionApi.create(createData);
        auctionId = created.id;
      }

      // Upload pending images in parallel, cover image first
      if (auctionId && pendingImages.length > 0) {
        // Reorder: put cover image first so it gets sortOrder 0
        const coverPendingIdx = coverIndex - existingImages.length;
        const orderedPending = [...pendingImages];
        if (coverPendingIdx >= 0 && coverPendingIdx < orderedPending.length) {
          const [cover] = orderedPending.splice(coverPendingIdx, 1);
          orderedPending.unshift(cover);
        }
        const results = await Promise.allSettled(
          orderedPending.map(img => imageApi.upload(auctionId, img.file))
        );
        const uploaded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected');
        if (uploaded > 0) {
          toast.success(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded!`);
        }
        if (failed.length > 0) {
          toast.error(`${failed.length} image${failed.length > 1 ? 's' : ''} failed to upload.`);
        }
      }

      toast.success(isEdit ? 'Product updated successfully!' : startMode === 'scheduled' ? 'Auction scheduled successfully!' : 'Product listed successfully!');
      await refreshAuctions();
      navigate('/seller/products');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - totalImages;
    if (remaining <= 0) {
      toast.error('Maximum 5 images allowed.');
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    const newPending: PendingImage[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        continue;
      }
      newPending.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setPendingImages(prev => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(prev => {
      const removed = prev[idx];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Compute summary for the duration + schedule section
  const durationHoursSummary = getDurationHours();
  const durationLabel = durationHoursSummary <= 0
    ? null
    : durationHoursSummary >= 24
      ? `${Math.floor(durationHoursSummary / 24)} day${Math.floor(durationHoursSummary / 24) > 1 ? 's' : ''}${durationHoursSummary % 24 > 0 ? ` ${durationHoursSummary % 24} hour${durationHoursSummary % 24 > 1 ? 's' : ''}` : ''}`
      : `${durationHoursSummary} hour${durationHoursSummary > 1 ? 's' : ''}`;
  const scheduleSummary = (() => {
    const durationPart = durationLabel ? `runs for ${durationLabel}` : 'set a duration (min 1 hour)';
    if (startMode === 'now') {
      return `Starts immediately, ${durationPart}`;
    }
    if (scheduledDateStr) {
      const d = new Date(`${scheduledDateStr}T${scheduledTimeStr}`);
      return `Starts ${d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}, ${durationPart}`;
    }
    return `Select a start date — ${durationPart}`;
  })();

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-floating-orbs opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-30" />

      <div className="relative container mx-auto px-4 max-w-3xl">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/20 to-border shadow-card mb-8">
          <div className="relative rounded-3xl bg-card/90 backdrop-blur-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                  Seller Zone
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {isEdit ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {isEdit ? 'Update your listing details below.' : 'Fill in the details to list your item for auction.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
            <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Title, category, and condition of your item.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Vintage Rolex Submariner 1968" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.name} value={c.name}>
                            <div className="flex items-center gap-2">
                              {c.icon}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      <SelectContent>
                        {conditions.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your item in detail — condition, history, provenance..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
            <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-lg font-semibold">Images</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Upload up to 5 high-quality photos. Click the star to set the cover photo.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {existingImages.map((img, idx) => {
                  const isCover = idx === coverIndex;
                  return (
                    <div
                      key={`existing-${idx}`}
                      className={cn(
                        "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                        isCover ? "border-primary ring-2 ring-primary/20" : "border-border"
                      )}
                      onClick={() => setCoverIndex(idx)}
                    >
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      {/* Cover badge */}
                      {isCover && (
                        <div className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 flex items-center gap-1">
                          <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                          <span className="text-sm font-bold text-primary-foreground">Cover</span>
                        </div>
                      )}
                      {/* Star icon on hover */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverIndex(idx); }}
                          className="absolute top-1.5 left-1.5 rounded-full bg-black/50 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Set as cover photo"
                        >
                          <StarBorder className="h-3.5 w-3.5 text-white" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingImage(idx);
                          if (coverIndex >= existingImages.length - 1 + pendingImages.length) setCoverIndex(0);
                          else if (idx < coverIndex) setCoverIndex(prev => prev - 1);
                          else if (idx === coverIndex) setCoverIndex(0);
                        }}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/50 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                  );
                })}
                {pendingImages.map((img, idx) => {
                  const combinedIdx = existingImages.length + idx;
                  const isCover = combinedIdx === coverIndex;
                  return (
                    <div
                      key={`pending-${idx}`}
                      className={cn(
                        "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                        isCover ? "border-primary ring-2 ring-primary/20" : "border-primary/30"
                      )}
                      onClick={() => setCoverIndex(combinedIdx)}
                    >
                      <img src={img.preview} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                      {/* Cover badge */}
                      {isCover ? (
                        <div className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 flex items-center gap-1">
                          <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                          <span className="text-sm font-bold text-primary-foreground">Cover</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverIndex(combinedIdx); }}
                          className="absolute top-1.5 left-1.5 rounded-full bg-black/50 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Set as cover photo"
                        >
                          <StarBorder className="h-3.5 w-3.5 text-white" />
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-sm text-center py-0.5 font-medium">
                        Pending upload
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePendingImage(idx);
                          if (coverIndex >= existingImages.length + pendingImages.length - 1) setCoverIndex(0);
                          else if (combinedIdx < coverIndex) setCoverIndex(prev => prev - 1);
                          else if (combinedIdx === coverIndex) setCoverIndex(0);
                        }}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/50 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                  );
                })}
                {totalImages < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-sm">Add Photo</span>
                  </button>
                )}
              </div>
              {totalImages > 0 && (
                <p className="text-sm text-muted-foreground mt-2">{totalImages}/5 images</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
            <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-lg font-semibold">Pricing</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Set your starting price and bid increment.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-price">Starting Price (₹) *</Label>
                  <Input
                    id="base-price"
                    type="number"
                    min="1"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-increment">Bid Increment (₹) *</Label>
                  <Input
                    id="bid-increment"
                    type="number"
                    min="1"
                    value={bidIncrement}
                    onChange={e => setBidIncrement(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling & Duration */}
          {!isEdit && (
            <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
              <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-semibold">Schedule & Duration</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Choose when your auction starts and how long it runs.</p>
                <div className="space-y-6">
                {/* Start Time Toggle */}
                <div className="space-y-3">
                  <Label>When should the auction start?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStartMode('now')}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 p-4 transition-all text-left",
                        startMode === 'now'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        startMode === 'now' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <PlayArrow className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">Start Now</p>
                        <p className="text-sm text-muted-foreground">Goes live immediately</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartMode('scheduled')}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 p-4 transition-all text-left",
                        startMode === 'scheduled'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        startMode === 'scheduled' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Schedule className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">Schedule</p>
                        <p className="text-sm text-muted-foreground">Pick a future date & time</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Scheduled Date-Time Picker */}
                {startMode === 'scheduled' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date Picker */}
                      <div className="space-y-2">
                        <Label htmlFor="scheduled-date" className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          Date *
                        </Label>
                        <Input
                          id="scheduled-date"
                          type="date"
                          value={scheduledDateStr}
                          onChange={e => setScheduledDateStr(e.target.value)}
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="font-mono"
                        />
                      </div>
                      {/* Time Picker */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          Time *
                        </Label>
                        <Select value={scheduledTimeStr} onValueChange={setScheduledTimeStr}>
                          <SelectTrigger className="font-mono">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeSlots.map(slot => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {scheduledDateStr && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-start gap-2">
                        <Schedule className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-base text-foreground">
                          Auction will go live on{' '}
                          <span className="font-semibold">
                            {new Date(`${scheduledDateStr}T${scheduledTimeStr}`).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                      </div>
                    )}
                    {!scheduledDateStr && (
                      <p className="text-sm text-muted-foreground">
                        Auction will remain in "Upcoming" status until the scheduled time, then automatically go live.
                      </p>
                    )}
                  </div>
                )}

                <div className="h-px bg-border" />

                {/* Duration */}
                <div className="space-y-3">
                  <Label>How long should the auction run?</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationMode('preset')}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        durationMode === 'preset' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationMode('custom')}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        durationMode === 'custom' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Custom
                    </button>
                  </div>

                  {durationMode === 'preset' ? (
                    <div className="flex flex-wrap gap-2">
                      {presetDurations.map(d => (
                        <button
                          key={d.hours}
                          type="button"
                          onClick={() => setPresetDuration(d.hours.toString())}
                          className={cn(
                            "rounded-xl px-3 py-2 text-base font-medium transition-colors border",
                            presetDuration === d.hours.toString()
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-end gap-3 animate-fade-in">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="custom-days" className="text-sm">Days</Label>
                        <Input
                          id="custom-days"
                          type="number"
                          min="0"
                          max="30"
                          value={customDurationDays}
                          onChange={e => setCustomDurationDays(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="custom-hours" className="text-sm">Hours</Label>
                        <Input
                          id="custom-hours"
                          type="number"
                          min="0"
                          max="23"
                          value={customDurationHours}
                          onChange={e => setCustomDurationHours(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className={cn(
                  "rounded-xl border p-3",
                  durationHoursSummary <= 0 ? "bg-destructive/5 border-destructive/20" : "bg-muted/50 border-border"
                )}>
                  <p className={cn("text-sm", durationHoursSummary <= 0 ? "text-destructive" : "text-muted-foreground")}>
                    <Schedule className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    {scheduleSummary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Duration for edit mode (simplified, no schedule change) */}
          {isEdit && (
            <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary/30 via-border to-border shadow-card">
              <div className="rounded-2xl bg-card/90 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-semibold">Duration</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Auction timing cannot be changed after creation.</p>
                <p className="text-base text-muted-foreground">
                  This auction was created with a fixed schedule. Start time and duration cannot be modified.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl gradient-gold px-8 py-3 text-base font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting
                ? 'Saving...'
                : isEdit
                  ? 'Save Changes'
                  : startMode === 'scheduled'
                    ? 'Schedule Auction'
                    : 'List for Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
