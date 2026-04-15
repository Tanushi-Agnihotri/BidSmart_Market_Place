import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineEmail as MdEmail, MdOutlineArrowBack as MdArrowBack, MdOutlineCheckCircle as MdCheckCircle } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Could not send reset link');
      }

      setSent(true);
      toast.success('If that email is registered, a reset link is on the way.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center pb-2">
          {sent ? (
            <>
              <div className="mx-auto mb-4 rounded-full bg-success/10 p-4 w-fit">
                <MdCheckCircle className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
              <CardDescription className="mt-2">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Please check your inbox and spam folder.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4 w-fit">
                <MdEmail className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Forgot Password?</CardTitle>
              <CardDescription className="mt-2">
                Enter the email associated with your account and we'll send a reset link.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {sent ? (
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Try a different email
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full gap-1.5">
                  <MdArrowBack className="h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground font-bold">
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
