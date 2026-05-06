import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, CheckCircle, XCircle, DollarSign, TrendingUp, RefreshCw, MessageSquare, FileText, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      const now = new Date();
      if (range === 'today') {
        params = { startDate: new Date(now.setHours(0,0,0,0)).toISOString() };
      } else if (range === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        params = { startDate: weekAgo.toISOString() };
      } else if (range === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        params = { startDate: monthAgo.toISOString() };
      }

      const res = await api.get('/dashboard/stats', { params });
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return <div className="text-center p-8 text-slate-500">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 mb-4">Failed to load statistics.</p>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: <Users className="w-4 h-4 text-slate-400" /> },
    { title: 'New', value: stats.newLeads, icon: <UserPlus className="w-4 h-4 text-blue-500" /> },
    { title: 'Contacted', value: stats.contactedLeads, icon: <MessageSquare className="w-4 h-4 text-yellow-500" /> },
    { title: 'Qualified', value: stats.qualifiedLeads, icon: <CheckCircle className="w-4 h-4 text-purple-500" /> },
    { title: 'Proposal', value: stats.proposalLeads, icon: <FileText className="w-4 h-4 text-orange-500" /> },
    { title: 'Won', value: stats.wonLeads, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
    { title: 'Lost', value: stats.lostLeads, icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { title: 'Win Rate', value: `${stats.winRate}%`, icon: <Target className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Sales performance and pipeline overview</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
          {['all', 'month', 'week', 'today'].map((r) => (
            <Button 
              key={r}
              variant={range === r ? 'secondary' : 'ghost'} 
              size="sm"
              className="capitalize"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg"><DollarSign className="w-5 h-5 text-slate-500" /></div>
                <div>
                  <div className="text-sm text-slate-500">Total Pipeline Value</div>
                  <div className="text-xl font-bold">${stats.totalDealValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
                <div>
                  <div className="text-sm text-slate-500">Won Deal Value</div>
                  <div className="text-xl font-bold text-green-600">${stats.totalWonValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><UserPlus className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <div className="text-sm text-slate-500">Leads Added (Last 7 Days)</div>
                  <div className="text-xl font-bold text-blue-600">{stats.leadsThisWeek}</div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
