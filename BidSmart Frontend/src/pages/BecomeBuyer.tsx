import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MdOutlineVerifiedUser,
  MdOutlineCloudUpload,
  MdOutlineCheckCircle,
  MdOutlineSecurity,
  MdOutlineGavel,
} from 'react-icons/md';
import { buyerProfileApi, type ApiMyBuyerProfile, type IdDocumentType } from '@/lib/apiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ID_TYPES: { value: IdDocumentType; label: string }[] = [
  { value: 'AADHAR', label: 'Aadhar Card' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
];

const BecomeBuyer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<ApiMyBuyerProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [form, setForm] = useState<{ legalName: string; idDocumentType: IdDocumentType | ''; idDocumentNumber: string }>({
    legalName: '',
    idDocumentType: '',
    idDocumentNumber: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await buyerProfileApi.getMine();
        if (!cancelled) setExisting(p);
      } catch {
        if (!cancelled) setExisting(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) return toast.error('Please upload your ID document.');
    if (!form.idDocumentType) return toast.error('Select an ID document type.');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('data', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      data.append('idDocument', idFile);
      const saved = await buyerProfileApi.submit(data);
      setExisting(saved);
      toast.success('Verification submitted. An admin will review shortly.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (existing && existing.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 animate-fade-in">
        <div className="max-w-md w-full rounded-2xl border border-warning/40 bg-warning/5 p-8 text-center shadow-card">
          <MdOutlineVerifiedUser className="h-14 w-14 mx-auto text-warning mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Verification Under Review</h2>
          <p className="text-muted-foreground">
            Your buyer verification is pending admin approval. You'll be notified once reviewed.
          </p>
        </div>
      </div>
    );
  }

  if (existing && existing.status === 'VERIFIED') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 animate-fade-in">
        <div className="max-w-md w-full rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center shadow-card">
          <MdOutlineCheckCircle className="h-14 w-14 mx-auto text-primary mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">You're Verified</h2>
          <p className="text-muted-foreground mb-6">
            You can now bid, use the watchlist, and sign consent forms.
          </p>
          <button
            onClick={() => navigate('/auctions')}
            className="rounded-xl gradient-gold py-3 px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            Browse Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-12 animate-fade-in">
      <div className="max-w-xl mx-auto">
        {existing && existing.status === 'REJECTED' && (
          <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive">Previous verification rejected</p>
            <p className="text-sm text-muted-foreground mt-1">
              {existing.rejectionReason || 'Please review your details and resubmit below.'}
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
            <MdOutlineGavel className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Buyer Verification</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Verify to Participate</h1>
          <p className="text-muted-foreground text-sm">
            To bid, use the watchlist, or sign consent forms, please verify your identity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-primary/10">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Full Legal Name</label>
            <input
              type="text"
              value={form.legalName}
              onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              required
              placeholder="As it appears on your ID"
              className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">ID Document Type</label>
            <Select
              value={form.idDocumentType}
              onValueChange={(v) => setForm({ ...form, idDocumentType: v as IdDocumentType })}
            >
              <SelectTrigger className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 h-auto text-sm">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {ID_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">ID Document Number</label>
            <input
              type="text"
              value={form.idDocumentNumber}
              onChange={(e) => setForm({ ...form, idDocumentNumber: e.target.value })}
              required
              placeholder="Enter your document number"
              className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Upload ID Document</label>
            <label className={cn(
              'border-2 border-dashed rounded-2xl p-6 hover:bg-muted/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center',
              idFile ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30'
            )}>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setIdFile(e.target.files[0])}
              />
              {idFile ? (
                <>
                  <MdOutlineCheckCircle className="w-8 h-8 text-primary mb-2" />
                  <p className="font-semibold text-sm">{idFile.name}</p>
                  <p className="text-xs text-primary mt-1">Click to replace</p>
                </>
              ) : (
                <>
                  <MdOutlineCloudUpload className="w-8 h-8 text-primary mb-2" />
                  <p className="font-semibold text-sm">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max. 10MB)</p>
                </>
              )}
            </label>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <MdOutlineSecurity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your ID is encrypted and used only to verify your identity. Verification usually completes within 24 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl gradient-gold py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-70"
          >
            {submitting ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeBuyer;
