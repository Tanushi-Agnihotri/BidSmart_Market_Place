import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdOutlineArrowBack as ArrowLeft,
  MdOutlineAddPhotoAlternate as ImagePlus,
  MdOutlineClose as X,
  MdOutlineSave as Save,
  MdOutlineSync as Loader2,
  MdOutlineSchedule as Schedule,
  MdOutlinePlayArrow as PlayArrow,
  MdOutlineCalendarToday as CalendarIcon,
  MdOutlineAccessTime as ClockIcon,
  MdOutlineStar as Star,
  MdOutlineStarBorder as StarBorder,
  MdOutlineInfo as Info,
  MdOutlineCurrencyRupee as RupeeSign,
  MdOutlinePhotoLibrary as PhotoLibrary,
  MdOutlineCategory as CategoryIcon,
  MdOutlineStorefront as StorefrontIcon,
  MdOutlineCheckCircle as CheckCircle,
  MdOutlineTrendingUp as TrendingUp,
  MdOutlineTimer as TimerIcon,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/mockData';
import { toast } from 'sonner';
import { auctionApi, imageApi, verificationDocApi, ApiError } from '@/lib/apiService';
import { cn } from '@/lib/utils';
import SellerAccessGate from '@/components/shared/SellerAccessGate';

const conditions = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair', 'Restored'];

const RULES_TEMPLATE = `1. Bidding
   - All bids placed are final and legally binding.
   - The highest verified bid at auction close wins.
   - The seller reserves the right to reject bids from unverified buyers.

2. Payment
   - The winning buyer must complete payment within 48 hours of auction close.
   - Accepted payment methods: [UPI / Bank Transfer / Other — specify here].
   - Failure to pay on time may result in forfeiture and account suspension.

3. Shipping & Delivery
   - Shipping costs are borne by the winning buyer unless stated otherwise.
   - Item will be dispatched within [X] business days of payment confirmation.
   - Shipping is available to: [specify regions/countries].

4. Item Condition
   - The item is sold as described in the listing. Buyer acknowledges reviewing all photos and details before bidding.
   - Condition: [New / Like New / Good / Fair — match listing].

5. Returns & Refunds
   - [No returns / Returns accepted within X days — specify your policy].
   - Refunds (if applicable) will be processed within [X] business days.

6. Disputes
   - Any disputes will be resolved through BidSmart's support team first.
   - Both parties agree to act in good faith.

By signing the consent form, the buyer confirms they have read and agreed to all of the above.`;
const presetDurations = [
  { label: '1 Hr', hours: 1 },
  { label: '2 Hrs', hours: 2 },
  { label: '4 Hrs', hours: 4 },
  { label: '6 Hrs', hours: 6 },
  { label: '8 Hrs', hours: 8 },
  { label: '12 Hrs', hours: 12 },
  { label: '18 Hrs', hours: 18 },
  { label: '24 Hrs', hours: 24 },
];

type PendingImage = { file: File; preview: string };
type PendingDoc = { file: File; docType: string };

const docTypes = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'RECEIPT', label: 'Purchase Receipt' },
  { value: 'CERTIFICATE', label: 'Authenticity Certificate' },
  { value: 'WARRANTY', label: 'Warranty Card' },
  { value: 'OTHER', label: 'Other' },
];

const getMinDate = () => new Date().toISOString().slice(0, 10);
const getMaxDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const timeSlots: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    timeSlots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}` });
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
  const [presetDuration, setPresetDuration] = useState('24');
  const [customDurationDays, setCustomDurationDays] = useState('');
  const [customDurationHours, setCustomDurationHours] = useState('');
  const [startMode, setStartMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDateStr, setScheduledDateStr] = useState('');
  const [scheduledTimeStr, setScheduledTimeStr] = useState('12:00');
  const [existingImages, setExistingImages] = useState<string[]>(existing?.images || []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [consentRequired, setConsentRequired] = useState<boolean>(existing?.consentRequired ?? false);
  const [rulesAndRegulations, setRulesAndRegulations] = useState<string>(existing?.rulesAndRegulations ?? '');
  const [consentStartDate, setConsentStartDate] = useState<string>(existing?.consentStartTime ? existing.consentStartTime.slice(0, 10) : '');
  const [consentStartTime, setConsentStartTime] = useState<string>(existing?.consentStartTime ? existing.consentStartTime.slice(11, 16) : '12:00');
  const [consentEndDate, setConsentEndDate] = useState<string>(existing?.consentEndTime ? existing.consentEndTime.slice(0, 10) : '');
  const [consentEndTime, setConsentEndTime] = useState<string>(existing?.consentEndTime ? existing.consentEndTime.slice(11, 16) : '12:00');
  const consentStart = consentStartDate ? `${consentStartDate}T${consentStartTime}` : '';
  const consentEnd = consentEndDate ? `${consentEndDate}T${consentEndTime}` : '';
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('INVOICE');

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title || '');
    setCategory(existing.category || '');
    setCondition(existing.condition || '');
    setDescription(existing.description || '');
    setBasePrice(existing.basePrice?.toString() || '');
    setBidIncrement(existing.bidIncrement?.toString() || '');
    setExistingImages(existing.images || []);
    setConsentRequired(existing.consentRequired ?? false);
    setRulesAndRegulations(existing.rulesAndRegulations ?? '');
    setConsentStartDate(existing.consentStartTime ? existing.consentStartTime.slice(0, 10) : '');
    setConsentStartTime(existing.consentStartTime ? existing.consentStartTime.slice(11, 16) : '12:00');
    setConsentEndDate(existing.consentEndTime ? existing.consentEndTime.slice(0, 10) : '');
    setConsentEndTime(existing.consentEndTime ? existing.consentEndTime.slice(11, 16) : '12:00');
  }, [existing?.id]);

  const totalImages = existingImages.length + pendingImages.length;

  if (currentRole !== 'seller') {
    return (
      <SellerAccessGate
        feature={id ? 'Edit Product' : 'List a Product'}
        description={id
          ? 'Editing a product listing is a seller-only action.'
          : 'Listing a product is a seller-only action — set your base price, upload photos, and start receiving bids.'}
      />
    );
  }

  if (isEdit && existing?.verificationStatus === 'VERIFIED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-4 shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-semibold">This listing is locked</h2>
          <p className="text-sm text-muted-foreground">
            Admin has verified this product. To protect buyers, verified listings cannot be edited. Contact support if a correction is needed.
          </p>
          <button onClick={() => navigate('/seller/products')} className="w-full rounded-xl gradient-gold py-2.5 text-sm font-bold text-primary-foreground shadow-elegant hover:scale-[1.01] transition-all">
            Back to My Products
          </button>
        </div>
      </div>
    );
  }

  const getDurationHours = (): number => {
    if (durationMode === 'preset') return parseInt(presetDuration);
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
    if (durationHours < 1) { toast.error('Auction duration must be at least 1 hour.'); return; }
    if (durationHours > 24) { toast.error('Auction duration cannot exceed 24 hours.'); return; }
    if (consentRequired) {
      if (!rulesAndRegulations.trim()) { toast.error('Rules and regulations are required when consent is enabled.'); return; }
      if (!consentStart || !consentEnd) { toast.error('Please set consent start and end times.'); return; }
      const cs = new Date(consentStart).getTime();
      const ce = new Date(consentEnd).getTime();
      if (ce <= cs) { toast.error('Consent end must be after consent start.'); return; }
      if (cs <= Date.now()) { toast.error('Consent start must be in the future.'); return; }
    }
    if (startMode === 'scheduled' && !scheduledDateStr) { toast.error('Please select a start date.'); return; }
    if (startMode === 'scheduled') {
      const scheduled = new Date(`${scheduledDateStr}T${scheduledTimeStr}`);
      if (scheduled.getTime() <= Date.now()) { toast.error('Scheduled start time must be in the future.'); return; }
    }
    if (!authToken) { toast.error('Please sign in to list products.'); return; }

    setSubmitting(true);
    try {
      let auctionId = id;
      const consentPayload = consentRequired ? {
        rulesAndRegulations: rulesAndRegulations.trim(),
        consentRequired: true,
        consentStartTime: new Date(consentStart).toISOString(),
        consentEndTime: new Date(consentEnd).toISOString(),
      } : { consentRequired: false };

      if (isEdit && id) {
        await auctionApi.update(id, { title, category, description, condition, basePrice: parseFloat(basePrice), bidIncrement: parseFloat(bidIncrement), ...consentPayload });
      } else {
        const createData: Parameters<typeof auctionApi.create>[0] = {
          title, category, description, condition,
          basePrice: parseFloat(basePrice), bidIncrement: parseFloat(bidIncrement), durationHours,
          ...consentPayload,
        };
        if (startMode === 'scheduled' && scheduledDateStr) {
          createData.scheduledStartTime = new Date(`${scheduledDateStr}T${scheduledTimeStr}`).toISOString();
        }
        const created = await auctionApi.create(createData);
        auctionId = created.id;
      }
      if (auctionId && pendingImages.length > 0) {
        const coverPendingIdx = coverIndex - existingImages.length;
        const orderedPending = [...pendingImages];
        if (coverPendingIdx >= 0 && coverPendingIdx < orderedPending.length) {
          const [cover] = orderedPending.splice(coverPendingIdx, 1);
          orderedPending.unshift(cover);
        }
        const results = await Promise.allSettled(orderedPending.map(img => imageApi.upload(auctionId, img.file)));
        const uploaded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        if (uploaded > 0) toast.success(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded!`);
        if (failed > 0) toast.error(`${failed} image${failed > 1 ? 's' : ''} failed to upload.`);
      }
      if (auctionId && pendingDocs.length > 0) {
        for (const pd of pendingDocs) {
          try {
            await verificationDocApi.upload(auctionId, pd.file, pd.docType);
          } catch (e) {
            toast.error(`Document "${pd.file.name}" failed: ${e instanceof ApiError ? e.message : 'upload error'}`);
          }
        }
      }
      toast.success(isEdit ? 'Product updated!' : startMode === 'scheduled' ? 'Auction scheduled!' : 'Product listed!');
      await refreshAuctions();
      navigate('/seller/products');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - totalImages;
    if (remaining <= 0) { toast.error('Maximum 5 images allowed.'); return; }
    const newPending: PendingImage[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image.`); continue; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB.`); continue; }
      newPending.push({ file, preview: URL.createObjectURL(file) });
    }
    setPendingImages(prev => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  };

  const durationHoursSummary = getDurationHours();
  const durationLabel = durationHoursSummary <= 0 ? null
    : durationHoursSummary >= 24
      ? `${Math.floor(durationHoursSummary / 24)}d${durationHoursSummary % 24 > 0 ? ` ${durationHoursSummary % 24}h` : ''}`
      : `${durationHoursSummary}h`;

  const coverImageSrc = (() => {
    const allImgs = [...existingImages, ...pendingImages.map(p => p.preview)];
    return allImgs[coverIndex] || null;
  })();

  return (
    <div className="relative min-h-screen overflow-hidden animate-fade-in">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-lines-pattern opacity-20" />

      <div className="relative flex min-h-screen">
        {/* ── LEFT PANEL ── sticky info sidebar */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 sticky top-0 h-screen pt-16 pb-6 px-6 xl:px-8 border-r border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8 mt-4"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Products
          </button>

          {/* Title */}
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Seller Zone</span>
            <h1 className="font-display text-2xl xl:text-3xl font-bold tracking-tight mt-1 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isEdit ? 'Update your listing details.' : 'List your item for auction.'}
            </p>
          </div>

          {/* Cover image preview */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 aspect-square mb-6 group">
            {coverImageSrc ? (
              <img src={coverImageSrc} alt="Cover preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                  <PhotoLibrary className="h-7 w-7 text-primary/50" />
                </div>
                <p className="text-xs text-muted-foreground text-center px-4">Cover photo will appear here</p>
              </div>
            )}
            {coverImageSrc && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-xs text-white font-medium">Cover Photo</span>
              </div>
            )}
          </div>

          {/* Live preview card */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Live Preview</p>
            <div>
              <p className="font-semibold text-sm truncate">{title || <span className="text-muted-foreground/50 font-normal">Product title...</span>}</p>
              <div className="flex items-center gap-2 mt-1">
                {category && <span className="text-xs text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">{category}</span>}
                {condition && <span className="text-xs text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">{condition}</span>}
              </div>
            </div>
            {basePrice && (
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-xs text-muted-foreground">Starting bid</span>
                <span className="font-mono font-bold text-primary text-sm">₹{parseFloat(basePrice).toLocaleString()}</span>
              </div>
            )}
            {bidIncrement && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Min. increment</span>
                <span className="font-mono text-xs text-foreground">₹{parseFloat(bidIncrement).toLocaleString()}</span>
              </div>
            )}
            {durationLabel && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-xs font-medium text-foreground">{durationLabel}</span>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-auto space-y-2">
            {[
              { icon: PhotoLibrary, text: 'Upload up to 5 clear photos' },
              { icon: TrendingUp, text: 'Competitive starting price gets more bids' },
              { icon: TimerIcon, text: '7-day auctions perform best' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── scrollable form */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-20 pb-16">

            {/* Mobile header */}
            <div className="lg:hidden mb-6">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-4"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Products
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Seller Zone</span>
              <h1 className="font-display text-2xl font-bold tracking-tight mt-0.5">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ── Basic Info ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-100">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <CategoryIcon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base">Basic Information</h2>
                      <p className="text-xs text-muted-foreground">Title, category, and condition</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title *</Label>
                      <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Vintage Rolex Submariner 1968" className="h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.name} value={c.name}>
                                <div className="flex items-center gap-2">{c.icon}<span>{c.name}</span></div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition *</Label>
                        <Select value={condition} onValueChange={setCondition}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe your item — condition, history, provenance..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Images ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-200">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <PhotoLibrary className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-base">Product Images</h2>
                      <p className="text-xs text-muted-foreground">Up to 5 photos — click ★ to set cover</p>
                    </div>
                    {totalImages > 0 && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">{totalImages}/5</span>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleFileSelect} />
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {existingImages.map((img, idx) => {
                      const isCover = idx === coverIndex;
                      return (
                        <div key={`ex-${idx}`} className={cn("relative group/img aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all", isCover ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")} onClick={() => setCoverIndex(idx)}>
                          <img src={img} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105" />
                          {isCover
                            ? <div className="absolute top-1 left-1 rounded-full bg-primary p-0.5"><Star className="h-2.5 w-2.5 text-primary-foreground fill-primary-foreground" /></div>
                            : <button type="button" onClick={e => { e.stopPropagation(); setCoverIndex(idx); }} className="absolute top-1 left-1 rounded-full bg-black/50 p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"><StarBorder className="h-2.5 w-2.5 text-white" /></button>
                          }
                          <button type="button" onClick={e => { e.stopPropagation(); setExistingImages(p => p.filter((_, i) => i !== idx)); if (coverIndex >= existingImages.length - 1) setCoverIndex(0); }} className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-destructive/80"><X className="h-2.5 w-2.5 text-white" /></button>
                        </div>
                      );
                    })}
                    {pendingImages.map((img, idx) => {
                      const cIdx = existingImages.length + idx;
                      const isCover = cIdx === coverIndex;
                      return (
                        <div key={`pend-${idx}`} className={cn("relative group/img aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all", isCover ? "border-primary ring-2 ring-primary/20" : "border-primary/30 hover:border-primary/50")} onClick={() => setCoverIndex(cIdx)}>
                          <img src={img.preview} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105" />
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[9px] text-center py-0.5 font-medium">Pending</div>
                          {isCover
                            ? <div className="absolute top-1 left-1 rounded-full bg-primary p-0.5"><Star className="h-2.5 w-2.5 text-primary-foreground fill-primary-foreground" /></div>
                            : <button type="button" onClick={e => { e.stopPropagation(); setCoverIndex(cIdx); }} className="absolute top-1 left-1 rounded-full bg-black/50 p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"><StarBorder className="h-2.5 w-2.5 text-white" /></button>
                          }
                          <button type="button" onClick={e => { e.stopPropagation(); removePendingImage(idx); if (coverIndex >= existingImages.length + pendingImages.length - 1) setCoverIndex(0); }} className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-destructive/80"><X className="h-2.5 w-2.5 text-white" /></button>
                        </div>
                      );
                    })}
                    {totalImages < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all group/add">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 group-hover/add:bg-primary/10 transition-colors">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-medium">Add</span>
                      </button>
                    )}
                  </div>
                  {totalImages > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" style={{ width: `${(totalImages / 5) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{totalImages}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Verification Documents ── */}
              {!isEdit && (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-250">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <CheckCircle className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-base">Verification Documents</h2>
                        <p className="text-xs text-muted-foreground">Upload invoice / certificate — system auto-verifies genuine listings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 items-stretch">
                      <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {docTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-all">
                        <ImagePlus className="h-4 w-4" />
                        Add document
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB.`); return; }
                            if (pendingDocs.length >= 5) { toast.error('Maximum 5 documents.'); return; }
                            setPendingDocs(prev => [...prev, { file, docType: selectedDocType }]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {pendingDocs.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {pendingDocs.map((d, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              <span className="shrink-0 rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                                {docTypes.find(t => t.value === d.docType)?.label ?? d.docType}
                              </span>
                              <span className="truncate">{d.file.name}</span>
                              <span className="shrink-0 text-muted-foreground">{(d.file.size / 1024).toFixed(0)} KB</span>
                            </div>
                            <button type="button" onClick={() => setPendingDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-3 text-[11px] text-muted-foreground">
                      PDF, JPG, PNG, or WebP · Max 10MB each · Up to 5 documents
                    </p>
                  </div>
                </div>
              )}

              {/* ── Pricing ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-300">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <RupeeSign className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base">Pricing</h2>
                      <p className="text-xs text-muted-foreground">Starting price and bid increment</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="base-price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Starting Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input id="base-price" type="number" min="1" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="0" className="h-10 pl-7 font-mono" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bid-increment" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bid Increment *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input id="bid-increment" type="number" min="1" value={bidIncrement} onChange={e => setBidIncrement(e.target.value)} placeholder="100" className="h-10 pl-7 font-mono" />
                      </div>
                    </div>
                  </div>
                  {basePrice && bidIncrement && (
                    <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-center gap-2 animate-fade-in">
                      <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Starts at <span className="font-mono font-semibold text-foreground">₹{parseFloat(basePrice).toLocaleString()}</span>, increments of <span className="font-mono font-semibold text-foreground">₹{parseFloat(bidIncrement).toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Schedule & Duration ── */}
              {!isEdit && (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-400">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Schedule className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-base">Schedule & Duration</h2>
                        <p className="text-xs text-muted-foreground">When it starts and how long it runs</p>
                      </div>
                    </div>

                    {/* Start mode */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        { mode: 'now' as const, icon: PlayArrow, title: 'Start Now', sub: 'Goes live immediately' },
                        { mode: 'scheduled' as const, icon: Schedule, title: 'Schedule', sub: 'Pick a future time' },
                      ].map(({ mode, icon: Icon, title, sub }) => (
                        <button key={mode} type="button" onClick={() => setStartMode(mode)}
                          className={cn("flex items-center gap-3 rounded-xl border-2 p-3.5 transition-all text-left", startMode === mode ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", startMode === mode ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{title}</p>
                            <p className="text-xs text-muted-foreground">{sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Date/time picker */}
                    {startMode === 'scheduled' && (
                      <div className="space-y-3 mb-5 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Date *</Label>
                            <Input type="date" value={scheduledDateStr} onChange={e => setScheduledDateStr(e.target.value)} min={getMinDate()} max={getMaxDate()} className="font-mono h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Time *</Label>
                            <Select value={scheduledTimeStr} onValueChange={setScheduledTimeStr}>
                              <SelectTrigger className="font-mono h-10"><SelectValue /></SelectTrigger>
                              <SelectContent className="max-h-52">
                                {timeSlots.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {scheduledDateStr && (
                          <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2 text-xs animate-fade-in">
                            <Schedule className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">Goes live <span className="font-semibold text-foreground">{new Date(`${scheduledDateStr}T${scheduledTimeStr}`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-border mb-5" />

                    {/* Duration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</Label>
                        <div className="flex gap-1.5">
                          {(['preset', 'custom'] as const).map(m => (
                            <button key={m} type="button" onClick={() => setDurationMode(m)}
                              className={cn("rounded-lg px-2.5 py-1 text-xs font-medium transition-all", durationMode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                              {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      {durationMode === 'preset' ? (
                        <div className="flex flex-wrap gap-2">
                          {presetDurations.map(d => (
                            <button key={d.hours} type="button" onClick={() => setPresetDuration(d.hours.toString())}
                              className={cn("rounded-xl px-3 py-1.5 text-xs font-medium transition-all border", presetDuration === d.hours.toString() ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="animate-fade-in">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Hours (1–24)</Label>
                            <Input type="number" min="1" max="24" value={customDurationHours} onChange={e => { setCustomDurationDays('0'); setCustomDurationHours(e.target.value); }} placeholder="1" className="h-10 font-mono" />
                          </div>
                        </div>
                      )}
                      {durationHoursSummary > 0 && (
                        <div className="rounded-xl bg-muted/60 border border-border p-3 flex items-center gap-2 text-xs animate-fade-in">
                          <TimerIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">
                            {startMode === 'now' ? 'Starts immediately' : scheduledDateStr ? 'Starts at scheduled time' : 'Starts at scheduled time'}, runs for <span className="font-semibold text-foreground">{durationLabel}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Buyer Consent ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-float-up delay-450">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-base">Buyer Consent Form</h2>
                      <p className="text-xs text-muted-foreground">Require buyers to sign before they can bid</p>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={consentRequired} onChange={e => setConsentRequired(e.target.checked)} className="h-4 w-4 accent-primary" />
                      <span className="text-sm font-medium">{consentRequired ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  {consentRequired && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rules &amp; Regulations *</Label>
                          <button
                            type="button"
                            onClick={() => setRulesAndRegulations(RULES_TEMPLATE)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Use template
                          </button>
                        </div>
                        <textarea value={rulesAndRegulations} onChange={e => setRulesAndRegulations(e.target.value)} rows={12} maxLength={10000}
                          placeholder={RULES_TEMPLATE}
                          className="w-full rounded-xl border border-border bg-muted/40 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 whitespace-pre-wrap" />
                        <p className="text-xs text-muted-foreground">Tip: Click "Use template" to load a starter format, then edit the details to match your auction.</p>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consent Window Start *</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Date *</Label>
                            <Input type="date" value={consentStartDate} onChange={e => setConsentStartDate(e.target.value)} min={getMinDate()} max={getMaxDate()} className="font-mono h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Time *</Label>
                            <Select value={consentStartTime} onValueChange={setConsentStartTime}>
                              <SelectTrigger className="font-mono h-10"><SelectValue /></SelectTrigger>
                              <SelectContent className="max-h-52">
                                {timeSlots.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consent Window End *</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Date *</Label>
                            <Input type="date" value={consentEndDate} onChange={e => setConsentEndDate(e.target.value)} min={getMinDate()} max={getMaxDate()} className="font-mono h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Time *</Label>
                            <Select value={consentEndTime} onValueChange={setConsentEndTime}>
                              <SelectTrigger className="font-mono h-10"><SelectValue /></SelectTrigger>
                              <SelectContent className="max-h-52">
                                {timeSlots.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Consent window and auction duration are independent. Auction duration: 1–24 hours.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 justify-end pt-2 animate-float-up delay-500">
                <button type="button" onClick={() => navigate('/seller/products')}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/20">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl gradient-gold px-7 py-2.5 text-sm font-bold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100">
                  {submitting ? <><span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Saving...</> : <><Save className="h-3.5 w-3.5" />{isEdit ? 'Save Changes' : startMode === 'scheduled' ? 'Schedule Auction' : 'List for Auction'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;
