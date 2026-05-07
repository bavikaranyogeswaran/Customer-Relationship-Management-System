import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { format } from 'date-fns';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0 });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Fetch users list for the salesperson filter (admin only)
  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser?.role === 'admin') {
        try {
          const res = await api.get('/users');
          setUsers(res.data);
        } catch (err) {
          console.error('Failed to fetch users for filter');
        }
      }
    };
    fetchUsers();
  }, [currentUser]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: {
          search,
          status: status || undefined,
          source: source || undefined,
          assigned_to: assignedTo || undefined,
          page: meta.page,
        }
      });
      setLeads(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, status, source, assignedTo, meta.page]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        toast.success('Lead deleted');
        fetchLeads();
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Qualified': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Proposal Sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Won': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleEdit = (lead: any, e: any) => {
    e.stopPropagation();
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Manage your sales pipeline</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search leads..." 
            className="pl-9 bg-white"
            value={search}
            onChange={(e: any) => { setSearch(e.target.value); setMeta(m => ({...m, page: 1}))}}
          />
        </div>
        <select 
          className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={status}
          onChange={(e: any) => { setStatus(e.target.value); setMeta(m => ({...m, page: 1}))}}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
        <select 
          className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          value={source}
          onChange={(e: any) => { setSource(e.target.value); setMeta(m => ({...m, page: 1}))}}
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Cold Email">Cold Email</option>
          <option value="Event">Event</option>
        </select>
        {currentUser?.role === 'admin' && (
          <select 
            className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={assignedTo}
            onChange={(e: any) => { setAssignedTo(e.target.value); setMeta(m => ({...m, page: 1}))}}
          >
            <option value="">All Salespersons</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Added / Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading leads...</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No leads found.</TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    <div className="text-sm text-slate-500">{lead.company}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    ${Number(lead.deal_value).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    <div className="text-sm">{format(new Date(lead.created_at), 'MMM d, yyyy')}</div>
                    {lead.updated_at && (
                      <div className="text-[10px] text-slate-400 uppercase italic">Updated: {format(new Date(lead.updated_at), 'MMM d')}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={(e: any) => handleEdit(lead, e)}>
                        <Edit2 className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e: any) => { e.stopPropagation(); handleDelete(lead.id); }}>
                        <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {meta.last_page > 1 && (
           <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-white">
             <Button variant="outline" size="sm" disabled={meta.page === 1} onClick={() => setMeta(m => ({...m, page: m.page - 1}))}>Previous</Button>
             <span className="text-sm text-slate-500">Page {meta.page} of {meta.last_page}</span>
             <Button variant="outline" size="sm" disabled={meta.page === meta.last_page} onClick={() => setMeta(m => ({...m, page: m.page + 1}))}>Next</Button>
           </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <LeadForm 
            lead={editingLead} 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => { setIsFormOpen(false); fetchLeads(); }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
