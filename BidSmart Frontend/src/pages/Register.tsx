import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdOutlineGavel,
  MdOutlineSecurity,
  MdOutlineCheckCircle,
  MdOutlineGroup,
  MdOutlineMail,
  MdOutlineLock,
  MdOutlinePersonOutline,
  MdOutlineArrowForward,
  MdOutlineVisibility as MdVisibility,
  MdOutlineVisibilityOff as MdVisibilityOff,
  MdOutlineEmojiEvents,
} from 'react-icons/md';
import loginImg from '@/assets/About.jpg';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api';
import { toast } from 'sonner';

type RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'terms';

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = Partial<Record<RegisterField, string>>;

type ApiValidationError = {
  field: string;
  message: string;
};

type ApiErrorResponse = {
  message?: string;
  validationErrors?: ApiValidationError[];
};

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['bg-destructive', 'bg-destructive', 'bg-amber-500', 'bg-amber-500', 'bg-success', 'bg-success'];
  return { score, label: labels[score], color: colors[score] };
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setFieldValue = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const errors: FieldErrors = {};

    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (form.password && form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptedTerms) errors.terms = 'Please accept the terms to continue';

    return errors;
  };

  const applyApiValidationErrors = (validationErrors: ApiValidationError[]) => {
    if (!validationErrors.length) return false;

    const nextErrors: FieldErrors = {};
    for (const error of validationErrors) {
      if (error.field === 'fullName') nextErrors.fullName = error.message;
      if (error.field === 'email') nextErrors.email = error.message;
      if (error.field === 'password') nextErrors.password = error.message;
    }

    setFieldErrors(prev => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length > 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const response = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'buyer',
        }),
      });

      const payload: ApiErrorResponse | null = await response.json().catch(() => null);

      if (!response.ok) {
        const hadFieldErrors = applyApiValidationErrors(payload?.validationErrors ?? []);
        if (!hadFieldErrors) {
          toast.error(payload?.message ?? 'Unable to create account');
        }
        return;
      }

      toast.success('Account created successfully!', {
        description: 'You can now sign in with your new credentials.',
      });
      navigate('/login');
    } catch {
      toast.error('Unable to reach the server', {
        description: 'Make sure the backend is running on port 8081.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] animate-fade-in">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden">
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
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">New Members</span>
          </div>

          <div className="flex items-center gap-4 mb-6 animate-float-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-md ring-1 ring-primary/40 animate-pulse-glow shrink-0">
              <MdOutlineGavel className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">Start your journey</p>
              <h2 className="font-display text-4xl font-bold text-white leading-tight">Join BidSmart</h2>
            </div>
          </div>

          <p className="text-lg text-white/75 mb-10 leading-relaxed animate-float-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Create your account and unlock a world of curated auctions &mdash; rare finds, expert sellers, fair bidding.
          </p>

          <div className="space-y-3">
            {[
              { icon: MdOutlineEmojiEvents, text: 'Access to exclusive premium auctions' },
              { icon: MdOutlineSecurity, text: 'Secure payments & guaranteed shipping' },
              { icon: MdOutlineGroup, text: 'Join a growing community of collectors' },
            ].map(({ icon: Icon, text }, i) => (
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
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />

        <div className="w-full max-w-md relative z-10 animate-float-up">
          <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.15)] border-primary/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-gold shadow-[0_8px_20px_-8px_hsl(var(--gold)/0.6)] lg:hidden">
                <MdOutlineGavel className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-1">Account</p>
                <h1 className="font-display text-3xl font-bold leading-none">Create Account</h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-7">Start your auction journey in under a minute.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Full Name</label>
                <div className="relative group">
                  <MdOutlinePersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={e => setFieldValue('fullName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    className={cn(
                      "w-full rounded-xl border border-border bg-muted/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all",
                      fieldErrors.fullName && "border-destructive focus:ring-destructive/30 focus:border-destructive"
                    )}
                  />
                </div>
                {fieldErrors.fullName && <p className="mt-1.5 text-xs text-destructive">{fieldErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Email</label>
                <div className="relative group">
                  <MdOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setFieldValue('email', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={cn(
                      "w-full rounded-xl border border-border bg-muted/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all",
                      fieldErrors.email && "border-destructive focus:ring-destructive/30 focus:border-destructive"
                    )}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1.5 text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Password</label>
                <div className="relative group">
                  <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={e => setFieldValue('password', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={cn(
                      "w-full rounded-xl border border-border bg-muted/60 pl-11 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all",
                      fieldErrors.password && "border-destructive focus:ring-destructive/30 focus:border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <MdVisibilityOff className="h-4 w-4" /> : <MdVisibility className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all",
                            i <= strength.score ? strength.color : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider shrink-0",
                      strength.score <= 1 ? "text-destructive" : strength.score <= 3 ? "text-amber-500" : "text-success"
                    )}>
                      {strength.label}
                    </span>
                  </div>
                )}
                {fieldErrors.password && <p className="mt-1.5 text-xs text-destructive">{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Confirm Password</label>
                <div className="relative group">
                  <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={e => setFieldValue('confirmPassword', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className={cn(
                      "w-full rounded-xl border border-border bg-muted/60 pl-11 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-muted transition-all",
                      fieldErrors.confirmPassword && "border-destructive focus:ring-destructive/30 focus:border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <MdVisibilityOff className="h-4 w-4" /> : <MdVisibility className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={acceptedTerms}
                    onChange={e => {
                      setAcceptedTerms(e.target.checked);
                      setFieldErrors(prev => ({ ...prev, terms: undefined }));
                    }}
                  />
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-border bg-muted transition-all peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 group-hover:border-primary/50 shrink-0">
                    <MdOutlineCheckCircle className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
                  </span>
                  <span className="leading-snug">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {fieldErrors.terms && <p className="mt-1.5 text-xs text-destructive">{fieldErrors.terms}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full rounded-xl gradient-gold py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.6)] transition-all hover:shadow-[0_15px_40px_-10px_hsl(var(--gold)/0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <MdOutlineArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
