import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Send, Building2, Mail, Phone, Globe, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeadDetails = async () => {
    try {
      const [leadRes, notesRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/notes`)
      ]);
      setLead(leadRes.data);
      setNotes(notesRes.data);
    } catch (err) {
      toast.error('Failed to fetch lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await api.post(`/leads/${id}/notes`, { content: newNote });
      setNewNote('');
      toast.success('Note added');
      // Refresh notes
      const notesRes = await api.get(`/leads/${id}/notes`);
      setNotes(notesRes.data);
    } catch (err) {
      toast.error('Failed to add note');
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

  if (loading) {
    return <div className="text-center p-8 text-slate-500">Loading lead details...</div>;
  }

  if (!lead) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <p className="text-sm text-slate-500">Lead Details</p>
        </div>
        <Badge variant="outline" className={`ml-auto ${getStatusColor(lead.status)} text-sm px-3 py-1`}>
          {lead.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{lead.company || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">{lead.phone || 'N/A'}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{lead.source}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium text-lg">${Number(lead.deal_value).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Created: {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Updated: {format(new Date(lead.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col h-full min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-lg">Notes & Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No notes yet. Add one below!</div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-slate-800 text-sm">{note.author_name}</span>
                        <span className="text-xs text-slate-400">{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleAddNote} className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                <Input 
                  value={newNote}
                  onChange={(e: any) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shrink-0 text-white" disabled={!newNote.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
