import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdOutlineLock as MdLock,
  MdOutlineArrowBack as MdArrowBack,
  MdOutlineCheckCircle as MdCheckCircle,
  MdOutlineVisibility as MdVisibility,
  MdOutlineVisibilityOff as MdVisibilityOff,
} from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing or invalid reset token.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Could not reset password');
      }

      setDone(true);
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription className="mt-2">
              This password reset link is missing or malformed. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link to="/forgot-password" className="block">
              <Button variant="outline" className="w-full">Request a new link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center pb-2">
          {done ? (
            <>
              <div className="mx-auto mb-4 rounded-full bg-success/10 p-4 w-fit">
                <MdCheckCircle className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="font-display text-2xl">Password Updated</CardTitle>
              <CardDescription className="mt-2">
                You can now sign in with your new password.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4 w-fit">
                <MdLock className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Choose a New Password</CardTitle>
              <CardDescription className="mt-2">
                Enter your new password below. Make it at least 8 characters.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {done ? (
            <Link to="/login" className="block">
              <Button className="w-full gradient-gold text-primary-foreground font-bold">
                Go to Login
              </Button>
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-gold text-primary-foreground font-bold"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full gap-1.5 text-muted-foreground">
                  <MdArrowBack className="h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
