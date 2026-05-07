import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LeadForm({ lead, onClose, onSuccess }: { lead?: any, onClose: () => void, onSuccess: () => void }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'Website',
    status: lead?.status || 'New',
    deal_value: lead?.deal_value || 0,
    assigned_to: lead?.assigned_to || '',
    version: lead?.version || 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.role === 'admin') {
        try {
          const res = await api.get('/users');
          setUsers(res.data);
          // If creating new lead and no assignee, default to current user
          if (!lead && !formData.assigned_to) {
             setFormData(prev => ({ ...prev, assigned_to: currentUser.id }));
          }
        } catch (err) {
          console.error('Failed to fetch users');
        }
      }
    };
    fetchUsers();
  }, [currentUser, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Strip empty/null assigned_to so the UUID validator is never triggered with a non-UUID
      const payload = { ...formData };
      if (!payload.assigned_to || payload.assigned_to === '') {
        delete (payload as any).assigned_to;
      }

      if (lead) {
        await api.patch(`/leads/${lead.id}`, payload);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error('Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Company</label>
        <Input value={formData.company} onChange={(e: any) => setFormData({...formData, company: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input 
            placeholder="0771234567" 
            pattern="^(?:\+94|94|0)\d{9}$"
            title="Please enter a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567)"
            value={formData.phone} 
            onChange={(e: any) => setFormData({...formData, phone: e.target.value})} 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select 
            className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={formData.status}
            onChange={(e: any) => setFormData({...formData, status: e.target.value})}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Source</label>
          <select 
            className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={formData.source}
            onChange={(e: any) => setFormData({...formData, source: e.target.value})}
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Cold Email">Cold Email</option>
            <option value="Event">Event</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Deal Value (LKR)</label>
          <Input type="number" min="0" value={formData.deal_value} onChange={(e: any) => setFormData({...formData, deal_value: Number(e.target.value)})} />
        </div>
        {currentUser?.role === 'admin' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <select 
              className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.assigned_to}
              onChange={(e: any) => setFormData({...formData, assigned_to: e.target.value})}
            >
              <option value="">Select Assignee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {loading ? 'Saving...' : 'Save Lead'}
        </Button>
      </div>
    </form>
  );
}
