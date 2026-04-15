import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdOutlineVerifiedUser, 
  MdOutlineAccountBalance, 
  MdOutlineStorefront, 
  MdOutlineCheckCircle,
  MdOutlineArrowForward,
  MdOutlineArrowBack,
  MdOutlineCloudUpload
} from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Become a Verified Seller</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join the world's most exclusive auction network. Reach thousands of premium buyers globally.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shadow-sm",
                step >= s.num ? "bg-primary text-primary-foreground scale-110" : "bg-card border border-border text-muted-foreground"
              )}>
                {step > s.num ? <MdOutlineCheckCircle className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
              </div>
              <span className={cn(
                "text-base font-semibold transition-colors",
                step >= s.num ? "text-foreground" : "text-muted-foreground"
              )}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-elegant card-glow relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="relative z-10">
            
            {/* Step 1: Store Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold font-display mb-1">Tell us about your business</h2>
                  <p className="text-muted-foreground mb-6">This will be visible to your prospective buyers.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Store/Business Name</label>
                    <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} required placeholder="e.g. Prestige Vintage Watches" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Primary Category</label>
                    <div className="relative">
                      <select name="businessCategory" value={formData.businessCategory} onChange={handleInputChange} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                        <option value="" disabled>Select a category</option>
                        <option value="watches">Watches & Jewelry</option>
                        <option value="art">Fine Art</option>
                        <option value="vehicles">Classic Vehicles</option>
                        <option value="other">Other Collectibles</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">▼</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Business Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="Briefly describe what makes your collection unique..." rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold font-display mb-1">Verify your identity</h2>
                  <p className="text-muted-foreground mb-6">We require ID verification to maintain our trusted marketplace.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Full Legal Name</label>
                    <input type="text" name="legalName" value={formData.legalName} onChange={handleInputChange} required placeholder="As it appears on your ID" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Government ID Upload</label>
                    <label className={cn(
                      "border-2 border-dashed rounded-2xl p-8 hover:bg-muted/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                      idFile ? "border-success/50 bg-success/5 hover:border-success" : "border-border hover:border-primary/50"
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
                          <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MdOutlineCheckCircle className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-foreground">{idFile.name}</p>
                          <p className="text-base text-success mt-1">Ready for verification. Click to replace.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MdOutlineCloudUpload className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-foreground">Click to upload or drag & drop</p>
                          <p className="text-base text-muted-foreground mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payouts */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold font-display mb-1">Where should we send your money?</h2>
                  <p className="text-muted-foreground mb-6">Enter your bank details to receive funds securely.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Account Holder Name</label>
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} required placeholder="Name on the account" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold mb-1.5">Bank Name</label>
                      <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} required placeholder="e.g. Chase Bank" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-base font-semibold mb-1.5">Routing Number</label>
                      <input type="text" name="routingNumber" value={formData.routingNumber} onChange={handleInputChange} required placeholder="9 digit routing number" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-1.5">Account Number</label>
                    <input type="password" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required placeholder="••••••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2 flex items-start gap-3">
                    <MdOutlineCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-base text-muted-foreground">
                      By submitting this application, you agree to BidSmart's <a href="#" className="text-primary font-medium hover:underline">Seller Terms of Service</a> and <a href="#" className="text-primary font-medium hover:underline">Fee Schedule</a>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                  step === 1 ? "opacity-0 pointer-events-none" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <MdOutlineArrowBack className="w-5 h-5" /> Back
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_hsl(var(--primary)/0.3)] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? 'Processing...' : step === 3 ? 'Submit Application' : 'Continue'} 
                {!isSubmitting && step !== 3 && <MdOutlineArrowForward className="w-5 h-5" />}
              </button>
            </div>
            
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default BecomeSeller;
