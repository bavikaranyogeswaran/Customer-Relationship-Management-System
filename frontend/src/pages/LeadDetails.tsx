import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Send, Building2, Mail, Phone, Globe, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Trash2, Edit2, Check, X as CloseIcon } from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
      fetchLeadDetails();
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/leads/${id}/notes/${noteId}`);
      toast.success('Note deleted');
      fetchLeadDetails();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;
    try {
      await api.patch(`/leads/${id}/notes/${noteId}`, { content: editNoteContent });
      setEditingNoteId(null);
      toast.success('Note updated');
      fetchLeadDetails();
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/leads/${id}`, { status: newStatus, version: lead.version });
      toast.success(`Status updated to ${newStatus}`);
      fetchLeadDetails();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('Concurrency conflict: Please refresh the page');
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setIsUpdatingStatus(false);
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                disabled={isUpdatingStatus}
                className={`h-8 ${getStatusColor(lead.status)} border px-3 py-1 font-semibold rounded-full hover:opacity-80 transition-opacity`}
              >
                {lead.status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
                  <Badge variant="outline" className={`${getStatusColor(s)} border-0 px-0`}>{s}</Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a>
                ) : (
                  <span className="text-slate-400 italic">No email provided</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">{lead.phone}</a>
                ) : (
                  <span className="text-slate-400 italic">No phone provided</span>
                )}
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
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">Assigned: <span className="font-medium">{lead.assignee_name || 'Unassigned'}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm pt-2 border-t border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 text-xs">Created: {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 text-xs">Updated: {lead.updated_at ? format(new Date(lead.updated_at), 'MMM d, yyyy') : 'Never'}</span>
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
                    <div key={note.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-sm">{note.author_name}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingNoteId(note.id); setEditNoteContent(note.content); }}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="space-y-2 mt-2">
                          <Input 
                            value={editNoteContent}
                            onChange={(e: any) => setEditNoteContent(e.target.value)}
                            className="text-sm bg-white"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingNoteId(null)}>
                              <CloseIcon className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleUpdateNote(note.id)}>
                              <Check className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      )}
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
