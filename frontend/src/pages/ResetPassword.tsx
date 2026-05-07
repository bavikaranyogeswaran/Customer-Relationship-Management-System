import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password });
      toast.success('Password reset successful. Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or incomplete.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-6">
            <span className="text-3xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CRM Pro</h1>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/50 backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">New Password</CardTitle>
            <CardDescription>
              Enter a strong password for your account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e: any) => setPassword(e.target.value)} 
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e: any) => setConfirmPassword(e.target.value)} 
                  className="bg-white"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-medium shadow-md shadow-indigo-600/10" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
