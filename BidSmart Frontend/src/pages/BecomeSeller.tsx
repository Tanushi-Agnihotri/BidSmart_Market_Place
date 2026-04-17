import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineVerifiedUser,
  MdOutlineAccountBalance,
  MdOutlineStorefront,
  MdOutlineCheckCircle,
  MdOutlineArrowForward,
  MdOutlineArrowBack,
  MdOutlineCloudUpload,
  MdOutlineGavel,
  MdOutlineSecurity,
  MdOutlineTrendingUp,
  MdOutlineGroup,
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import loginImg from '@/assets/About.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { upgradeRole } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    storeName: '',
    businessCategory: '',
    description: '',
    legalName: '',
    accountHolderName: '',
    bankName: '',
    routingNumber: '',
    accountNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const steps = [
    { num: 1, title: 'Store Details', icon: MdOutlineStorefront },
    { num: 2, title: 'Verification', icon: MdOutlineVerifiedUser },
    { num: 3, title: 'Payouts', icon: MdOutlineAccountBalance },
  ];

  const handleNext = () => {
    if (step === 2 && !idFile) {
      toast.error('Please upload your Government ID to continue.');
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  };
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      toast.error('Please upload your Government ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      data.append('idDocument', idFile);

      const { userApi } = await import('@/lib/apiService');
      await userApi.becomeSeller(data);

      toast.success('Your Seller Profile has been created! Welcome to BidSmart selling.');
      upgradeRole('seller');
      navigate('/seller/dashboard');
    } catch (err: any) {
      console.error('[BecomeSeller] Submit error:', err);
      const msg = err?.message || 'Failed to submit application';
      toast.error(msg);
      if (err?.validationErrors?.length) {
        err.validationErrors.forEach((ve: any) => toast.error(`${ve.field}: ${ve.message}`));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: MdOutlineTrendingUp, text: 'Reach thousands of premium buyers' },
    { icon: MdOutlineSecurity, text: 'Secure & encrypted transactions' },
    { icon: MdOutlineGroup, text: 'Dedicated seller support team' },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] animate-fade-in">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden pt-16">
        <img src={loginImg} alt="" className="absolute inset-0 h-full w-full object-cover animate-hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-primary/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />

        {/* Floating gold particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/40"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                animation: `particle-rise ${Math.random() * 8 + 5}s linear ${Math.random() * 4}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-lg px-12 py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md mb-8 animate-float-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Seller Program</span>
          </div>

          <div className="flex items-center gap-4 mb-6 animate-float-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-md ring-1 ring-primary/40 animate-pulse-glow shrink-0">
              <MdOutlineGavel className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">Exclusive access</p>
              <h2 className="font-display text-4xl font-bold text-white leading-tight">Start Selling</h2>
            </div>
          </div>

          <p className="text-lg text-white/75 mb-10 leading-relaxed animate-float-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Join the world's most exclusive auction network. List your premium items and connect with serious collectors worldwide.
          </p>

          <div className="space-y-3">
            {benefits.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md animate-float-up transition-all hover:border-primary/40 hover:bg-white/10"
                style={{ animationDelay: `${(i + 3) * 120}ms`, animationFillMode: 'both' }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/30 shrink-0 transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-white/90 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Progress indicator on left panel */}
          <div className="mt-12 animate-float-up" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">Step {step} of 3</span>
              <span className="text-xs text-white/40">|</span>
              <span className="text-xs text-white/60">{steps[step - 1].title}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full gradient-gold transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex items-start justify-center p-6 sm:p-10 bg-background relative overflow-hidden min-h-screen pt-24 lg:pt-28">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />

        <div className="w-full max-w-lg relative z-10 animate-float-up">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <MdOutlineGavel className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Seller Program</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Become a Verified Seller</h1>
            <p className="text-muted-foreground text-sm">Join the world's most exclusive auction network.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-6 relative px-4">
            <div className="absolute left-4 right-4 top-6 h-0.5 bg-border rounded-full" />
            <div
              className="absolute left-4 top-6 h-0.5 gradient-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * (100 - (8 / 3))}%` }}
            />

            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                  step > s.num
                    ? "gradient-gold text-primary-foreground shadow-[0_8px_20px_-8px_hsl(var(--gold)/0.6)] scale-100"
                    : step === s.num
                    ? "gradient-gold text-primary-foreground shadow-[0_8px_20px_-8px_hsl(var(--gold)/0.6)] scale-110"
                    : "bg-card border border-border text-muted-foreground"
                )}>
                  {step > s.num ? <MdOutlineCheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-xs font-semibold transition-colors",
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                )}>{s.title}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.15)] border-primary/10">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

              {/* Step 1: Store Details */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-1">Step 1</p>
                    <h2 className="text-2xl font-bold font-display">Tell us about your business</h2>
                    <p className="text-sm text-muted-foreground mt-1">This will be visible to your prospective buyers.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Store/Business Name</label>
                    <div className="relative group">
                      <MdOutlineStorefront className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Prestige Vintage Watches"
                        className="w-full rounded-xl border border-border bg-muted/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Primary Category</label>
                    <Select
                      value={formData.businessCategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, businessCategory: value }))}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 h-auto text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-border bg-card shadow-lg">
                        <SelectItem value="watches" className="rounded-lg cursor-pointer">Watches & Jewelry</SelectItem>
                        <SelectItem value="art" className="rounded-lg cursor-pointer">Fine Art</SelectItem>
                        <SelectItem value="vehicles" className="rounded-lg cursor-pointer">Classic Vehicles</SelectItem>
                        <SelectItem value="other" className="rounded-lg cursor-pointer">Other Collectibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Business Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Briefly describe what makes your collection unique..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Verification */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-1">Step 2</p>
                    <h2 className="text-2xl font-bold font-display">Verify your identity</h2>
                    <p className="text-sm text-muted-foreground mt-1">We require ID verification to maintain our trusted marketplace.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Full Legal Name</label>
                    <div className="relative group">
                      <MdOutlineVerifiedUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                      <input
                        type="text"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleInputChange}
                        required
                        placeholder="As it appears on your ID"
                        className="w-full rounded-xl border border-border bg-muted/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Government ID Upload</label>
                    <label className={cn(
                      "border-2 border-dashed rounded-2xl p-8 hover:bg-muted/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                      idFile
                        ? "border-primary/40 bg-primary/5 hover:border-primary/60"
                        : "border-border hover:border-primary/30"
                    )}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setIdFile(e.target.files[0]);
                            toast.success('File attached successfully');
                          }
                        }}
                      />
                      {idFile ? (
                        <>
                          <div className="w-12 h-12 gradient-gold text-primary-foreground rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_8px_20px_-8px_hsl(var(--gold)/0.5)]">
                            <MdOutlineCheckCircle className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-foreground text-sm">{idFile.name}</p>
                          <p className="text-xs text-primary mt-1">Ready for verification. Click to replace.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ring-1 ring-primary/20">
                            <MdOutlineCloudUpload className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-foreground text-sm">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max. 10MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Payouts */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-1">Step 3</p>
                    <h2 className="text-2xl font-bold font-display">Set up your payouts</h2>
                    <p className="text-sm text-muted-foreground mt-1">Enter your bank details to receive funds securely.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Account Holder Name</label>
                    <div className="relative group">
                      <MdOutlineAccountBalance className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                      <input
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleInputChange}
                        required
                        placeholder="Name on the account"
                        className="w-full rounded-xl border border-border bg-muted/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Chase Bank"
                        className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Routing Number</label>
                      <input
                        type="text"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="9 digit routing number"
                        className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Account Number</label>
                    <input
                      type="password"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all"
                    />
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                    <MdOutlineSecurity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By submitting, you agree to BidSmart's{' '}
                      <a href="/terms" className="text-primary font-medium hover:underline">Seller Terms</a> and{' '}
                      <a href="/terms" className="text-primary font-medium hover:underline">Fee Schedule</a>.
                      Your data is encrypted end-to-end.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/50">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
                    step === 1
                      ? "opacity-0 pointer-events-none"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MdOutlineArrowBack className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative rounded-xl gradient-gold py-3 px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.6)] transition-all hover:shadow-[0_15px_40px_-10px_hsl(var(--gold)/0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Processing...
                      </>
                    ) : step === 3 ? (
                      'Submit Application'
                    ) : (
                      <>
                        Continue
                        <MdOutlineArrowForward className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* Mobile progress bar */}
          <div className="lg:hidden mt-6 px-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Step {step} of 3</span>
              <span className="text-xs text-muted-foreground">{steps[step - 1].title}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full gradient-gold transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
