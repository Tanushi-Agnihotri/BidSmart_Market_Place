import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineVisibility as MdVisibility, MdOutlineVisibilityOff as MdVisibilityOff, MdOutlineGavel, MdOutlineSecurity, MdOutlineCheckCircle, MdOutlineGroup, MdOutlineMail, MdOutlineLock, MdOutlineArrowForward } from 'react-icons/md';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '@/context/AppContext';
import type { User, UserRole } from '@/data/mockData';
import loginImg from '@/assets/About.jpg';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

type LoginForm = {
  email: string;
  password: string;
};

type LoginField = keyof LoginForm;

type LoginFieldErrors = Partial<Record<LoginField, string>>;

type ApiValidationError = {
  field: string;
  message: string;
};

type LoginErrorResponse = {
  message?: string;
  validationErrors?: ApiValidationError[];
};

type AuthUserResponse = {
  id: string;
  fullName: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};

type LoginSuccessResponse = {
  token: string;
  tokenType: string;
  user: AuthUserResponse;
};

const avatarByRole: Record<'BUYER' | 'SELLER' | 'ADMIN', string> = {
  BUYER: '🛒',
  SELLER: '🏪',
  ADMIN: '🛡️',
};

const dashboardRouteByRole: Record<'BUYER' | 'SELLER' | 'ADMIN', string> = {
  BUYER: '/buyer/dashboard',
  SELLER: '/seller/dashboard',
  ADMIN: '/admin/dashboard',
};

const toFrontendUser = (user: AuthUserResponse): User => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: user.role.toLowerCase() as UserRole,
  status: user.status.toLowerCase() as User['status'],
  avatar: avatarByRole[user.role],
  joinDate: user.createdAt,
  stats: {},
});

const googleClientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const Login = () => {
  const navigate = useNavigate();
  const { setAuthenticatedSession } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleSuccess = async (accessToken: string) => {
    setGoogleLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: accessToken }),
      });

      const payload: LoginSuccessResponse | LoginErrorResponse | null = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error((payload as LoginErrorResponse | null)?.message ?? 'Google sign-in failed');
        return;
      }

      const authPayload = payload as LoginSuccessResponse;
      const user = toFrontendUser(authPayload.user);
      setAuthenticatedSession(user, authPayload.token, rememberMe);

      toast.success('Signed in with Google!', {
        description: `Welcome, ${authPayload.user.fullName}.`,
      });

      navigate(dashboardRouteByRole[authPayload.user.role]);
    } catch {
      toast.error('Unable to reach the server', {
        description: 'Make sure the backend is running on port 8081.',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleSuccess(tokenResponse.access_token),
    onError: () => toast.error('Google sign-in was cancelled or failed'),
    scope: 'openid email profile',
  });

  const onGoogleClick = () => {
    if (!googleClientConfigured) {
      toast.error('Google Sign-In is not configured', {
        description: 'Set VITE_GOOGLE_CLIENT_ID in BidSmart Frontend/.env and restart.',
      });
      return;
    }
    triggerGoogleLogin();
  };

  const setFieldValue = (field: LoginField, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const errors: LoginFieldErrors = {};
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    return errors;
  };

  const applyApiValidationErrors = (validationErrors: ApiValidationError[]) => {
    if (!validationErrors.length) return false;

    const nextErrors: LoginFieldErrors = {};
    for (const error of validationErrors) {
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
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const payload: LoginSuccessResponse | LoginErrorResponse | null = await response.json().catch(() => null);

      if (!response.ok) {
        const hadFieldErrors = applyApiValidationErrors((payload as LoginErrorResponse | null)?.validationErrors ?? []);
        if (!hadFieldErrors) {
          toast.error((payload as LoginErrorResponse | null)?.message ?? 'Unable to sign in');
        }
        return;
      }

      const authPayload = payload as LoginSuccessResponse;
      const user = toFrontendUser(authPayload.user);
      setAuthenticatedSession(user, authPayload.token, rememberMe);

      toast.success('Signed in successfully!', {
        description: `Welcome back, ${authPayload.user.fullName}.`,
      });

      navigate(dashboardRouteByRole[authPayload.user.role]);
    } catch {
      toast.error('Unable to reach the server', {
        description: 'Make sure the backend is running on port 8081.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] animate-fade-in">
      {/* Left Panel - Enhanced with particles and overlays */}
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
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Live Auctions</span>
          </div>

          <div className="flex items-center gap-4 mb-6 animate-float-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-md ring-1 ring-primary/40 animate-pulse-glow shrink-0">
              <MdOutlineGavel className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">Premium access</p>
              <h2 className="font-display text-4xl font-bold text-white leading-tight">Welcome Back</h2>
            </div>
          </div>

          <p className="text-lg text-white/75 mb-10 leading-relaxed animate-float-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Step back into the world of curated auctions &mdash; where every bid tells a story.
          </p>

          <div className="space-y-3">
            {[
              { icon: MdOutlineSecurity, text: 'Secure & encrypted transactions' },
              { icon: MdOutlineCheckCircle, text: 'Verified sellers & authentic items' },
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
                <h1 className="font-display text-3xl font-bold leading-none">Sign In</h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-7">Enter your credentials to continue to your personal auction room.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                {fieldErrors.email && <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Password</label>
                <div className="relative group">
                  <MdOutlineLock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                {fieldErrors.password && <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">{fieldErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-muted transition-all peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 group-hover:border-primary/50">
                    <MdOutlineCheckCircle className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
                  </span>
                  <span className="group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full rounded-xl gradient-gold py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.6)] transition-all hover:shadow-[0_15px_40px_-10px_hsl(var(--gold)/0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <MdOutlineArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-border/70" />
                <span className="mx-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Or continue with</span>
                <div className="flex-grow border-t border-border/70" />
              </div>

              <button
                type="button"
                onClick={onGoogleClick}
                disabled={googleLoading}
                className="group w-full rounded-xl border border-border bg-card/50 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-card flex items-center justify-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {googleLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                    Signing in with Google...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </form>

          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
