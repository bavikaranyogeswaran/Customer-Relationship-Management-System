import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, ShieldAlert, CheckCircle, XCircle, UserPlus, Mail, MoreVertical, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserOnboardingDialog from '@/components/UserOnboardingDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: any) => {
    try {
      await api.patch(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const changeRole = async (user: any, newRole: string) => {
    if (user.role === newRole) return;
    try {
      await api.patch(`/users/${user.id}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const resendInvitation = async (email: string) => {
    try {
      await api.post('/auth/resend-invitation', { email });
      toast.success('Invitation resent');
    } catch (err) {
      toast.error('Failed to resend invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Control access, manage roles, and onboard your sales team.</p>
        </div>
        <Button 
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Onboard Salesperson
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 font-bold">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 hover:bg-white border border-transparent hover:border-slate-200">
                            {user.role === 'admin' ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span className="capitalize font-medium">{user.role}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => changeRole(user, 'user')}>
                            Salesperson (User)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeRole(user, 'admin')}>
                            Administrator
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => resendInvitation(user.email)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleUserStatus(user)}
                            className={user.is_active ? "text-red-600" : "text-green-600"}
                          >
                            {user.is_active ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate Account
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate Account
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Onboard New Member</DialogTitle>
            <p className="text-sm text-slate-500">
              Send an invitation email to a new team member. They will be prompted to set their password.
            </p>
          </DialogHeader>
          <UserOnboardingDialog 
            onClose={() => setIsInviteOpen(false)} 
            onSuccess={() => { setIsInviteOpen(false); fetchUsers(); }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
