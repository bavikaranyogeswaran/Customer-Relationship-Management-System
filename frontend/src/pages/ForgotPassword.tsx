import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError('Failed to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg">
                  {message}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e: any) => setEmail(e.target.value)} 
                  className="bg-white"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-medium shadow-md shadow-indigo-600/10" disabled={loading || !!message}>
                {loading ? 'Please wait...' : 'Send Reset Link'}
              </Button>
              <div className="text-sm text-center text-slate-500">
                Remember your password? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
