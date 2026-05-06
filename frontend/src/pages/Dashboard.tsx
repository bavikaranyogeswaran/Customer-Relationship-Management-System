import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserPlus, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-slate-500">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center p-8 text-red-500">Failed to load statistics.</div>;
  }

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: <Users className="w-4 h-4 text-slate-500" /> },
    { title: 'New Leads', value: stats.newLeads, icon: <UserPlus className="w-4 h-4 text-blue-500" /> },
    { title: 'Qualified', value: stats.qualifiedLeads, icon: <CheckCircle className="w-4 h-4 text-purple-500" /> },
    { title: 'Won', value: stats.wonLeads, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
    { title: 'Lost', value: stats.lostLeads, icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { title: 'Total Value', value: `$${stats.totalDealValue.toLocaleString()}`, icon: <DollarSign className="w-4 h-4 text-slate-500" /> },
    { title: 'Won Value', value: `$${stats.totalWonValue.toLocaleString()}`, icon: <DollarSign className="w-4 h-4 text-green-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your sales pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
