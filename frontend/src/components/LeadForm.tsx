import { useState } from 'react';
import api from '../lib/axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

export default function LeadForm({ lead, onClose, onSuccess }: { lead?: any, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'Website',
    status: lead?.status || 'New',
    deal_value: lead?.deal_value || 0,
    version: lead?.version || 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (lead) {
        await api.patch(`/leads/${lead.id}`, formData);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', formData);
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
          <Input value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
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
          <label className="text-sm font-medium">Deal Value ($)</label>
          <Input type="number" min="0" value={formData.deal_value} onChange={(e: any) => setFormData({...formData, deal_value: Number(e.target.value)})} />
        </div>
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
