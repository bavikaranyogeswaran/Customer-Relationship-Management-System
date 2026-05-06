import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@crm.com'); // Default for easy testing
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.access_token, res.data.user);
        navigate('/');
      } else {
        await api.post('/auth/register', { email, password, name });
        // Auto login after registration
        const loginRes = await api.post('/auth/login', { email, password });
        login(loginRes.data.access_token, loginRes.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
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
          <p className="text-slate-500 mt-2">Manage your leads like a professional</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/50 backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create an account'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Enter your details to access your account' : 'Fill in the form below to get started'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input 
                    required 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e: any) => setName(e.target.value)} 
                    className="bg-white"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="admin@crm.com" 
                  value={email} 
                  onChange={(e: any) => setEmail(e.target.value)} 
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  {isLogin && <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>}
                </div>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e: any) => setPassword(e.target.value)} 
                  className="bg-white"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-medium shadow-md shadow-indigo-600/10" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
              </Button>
              <div className="text-sm text-center text-slate-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
