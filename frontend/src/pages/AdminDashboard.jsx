import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Users, RefreshCw, Crown, UserCheck, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_CONFIG = {
    admin: { label: 'Admin', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Crown },
    verifier: { label: 'Verifier', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: UserCheck },
    user: { label: 'User', color: 'bg-muted text-muted-foreground border-border', icon: UserIcon },
};

const RoleBadge = ({ role }) => {
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

export const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingChange, setPendingChange] = useState(null); // { userId, newRole, userName }

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getUsers();
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleSelect = (userId, newRole, userName) => {
        setPendingChange({ userId, newRole, userName });
    };

    const confirmRoleChange = async () => {
        if (!pendingChange) return;
        try {
            await adminAPI.updateUserRole(pendingChange.userId, pendingChange.newRole);
            toast.success(`Updated ${pendingChange.userName}'s role to ${pendingChange.newRole}`);
            await fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update role');
        } finally {
            setPendingChange(null);
        }
    };

    const stats = {
        total: users.length,
        users: users.filter(u => u.role === 'user').length,
        verifiers: users.filter(u => u.role === 'verifier').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-muted-foreground text-sm">Manage user roles and permissions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/verifier/dashboard')}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Verify Lands
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.total, color: 'from-primary/20 to-secondary/20', icon: Users },
                        { label: 'Citizens', value: stats.users, color: 'from-muted/50 to-muted/30', icon: UserIcon },
                        { label: 'Verifiers', value: stats.verifiers, color: 'from-blue-500/20 to-blue-400/10', icon: UserCheck },
                        { label: 'Admins', value: stats.admins, color: 'from-amber-500/20 to-orange-400/10', icon: Crown },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <Card key={label} className={`bg-gradient-to-br ${color} border-border/50`}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className="w-8 h-8 text-muted-foreground" />
                                <div>
                                    <div className="text-2xl font-bold font-['Space_Grotesk']">{value}</div>
                                    <div className="text-xs text-muted-foreground">{label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Users Table */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            All Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading users...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Change Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => {
                                        const isSelf = u._id === currentUser?.id || u._id === currentUser?._id;
                                        return (
                                            <TableRow key={u._id}>
                                                <TableCell className="font-medium">
                                                    {u.full_name || u.username}
                                                    {isSelf && (
                                                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                                <TableCell><RoleBadge role={u.role} /></TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {isSelf ? (
                                                        <span className="text-xs text-muted-foreground italic">Cannot change own role</span>
                                                    ) : (
                                                        <Select
                                                            value={u.role}
                                                            onValueChange={(newRole) => handleRoleSelect(u._id, newRole, u.full_name || u.username)}
                                                        >
                                                            <SelectTrigger className="w-32 h-8 text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="user">User</SelectItem>
                                                                <SelectItem value="verifier">Verifier</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change <strong>{pendingChange?.userName}</strong>'s role to{' '}
                            <strong>{pendingChange?.newRole}</strong>? This will immediately affect their access.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
