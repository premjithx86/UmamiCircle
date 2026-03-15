import React, { useState, useEffect } from 'react';
import { getUsers, toggleBlockUser, deleteUser } from '../services/adminService';
import { Search, Shield, ShieldOff, Trash2, User as UserIcon, Loader2, MoreVertical, Mail } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { cn } from "../lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

import { Skeleton } from '../components/ui/skeleton';
import { Copy, Check } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';

/**
 * Helper component to display and copy IDs.
 */
const CopyableID = ({ id, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-center gap-2 font-mono text-[9px] group/id", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="opacity-60 group-hover/id:opacity-100 transition-opacity cursor-help truncate max-w-[120px] lg:max-w-none">
            {id}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-primary text-white font-bold border-none text-[10px]">
          Full ID: {id}
        </TooltipContent>
      </Tooltip>
      <button 
        onClick={copy}
        className="p-1 rounded-md bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover/id:opacity-100"
      >
        {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
      </button>
    </div>
  );
};

/**
 * User Management page for searching, blocking, and deleting users.
 */
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      const data = await getUsers(searchTerm);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    try {
      const updatedUser = await toggleBlockUser(userId, !currentlyBlocked);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
      toast.success(`Chef ${currentlyBlocked ? 'restored' : 'restricted'} successfully`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setUserToDelete(null);
      toast.success('Chef removed from the kitchen');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">User Kitchen</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Manage platform members and their access</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
          <Input
            placeholder="Search chefs by name, email, or @username..."
            className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm focus-visible:ring-primary text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="border-border bg-card shadow-lg rounded-[2rem] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Chef</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Credentials</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gathering chefs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
                      No matching chefs found in the kitchen
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} className="hover:bg-muted/20 border-border/50 transition-all duration-300">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12 border-2 border-background ring-1 ring-border shadow-sm">
                            <AvatarImage src={user.profilePicUrl} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                              {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-black text-sm truncate tracking-tight">{user.name}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">@{user.username}</p>
                              <span className="text-muted-foreground/30">•</span>
                              <CopyableID id={user._id} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={12} className="shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[200px]">{user.email}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-black uppercase px-2 h-5">
                            {String(user.role || 'chef')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-center">
                        <Badge 
                          className={cn(
                            "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                            user.isBlocked ? "bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "bg-green-500/10 text-green-500"
                          )}
                        >
                          {user.isBlocked ? 'Banned' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                            className={cn(
                              "rounded-xl size-9 transition-all",
                              user.isBlocked 
                                ? "text-green-500 hover:bg-green-500/10" 
                                : "text-orange-500 hover:bg-orange-500/10"
                            )}
                            title={user.isBlocked ? 'Unblock Chef' : 'Ban Chef'}
                          >
                            {user.isBlocked ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user)}
                            className="rounded-xl size-9 text-destructive hover:bg-destructive/10 transition-all"
                            title="Remove Chef"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-border/50">
            {loading && users.length === 0 ? (
              <div className="py-20 text-center">
                <Loader2 className="size-8 text-primary animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">Gathering chefs...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
                No matching chefs found
              </div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14 border-2 border-background ring-1 ring-border shadow-md">
                        <AvatarImage src={user.profilePicUrl} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-black text-base truncate tracking-tight">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">@{user.username}</p>
                          <span className="text-muted-foreground/30">•</span>
                          <CopyableID id={user._id} />
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                        user.isBlocked ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
                      )}
                    >
                      {user.isBlocked ? 'Banned' : 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-xl bg-muted/30 border border-border/50">
                    <Mail size={12} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{user.email}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-10 border-border"
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? <Shield className="mr-2 size-3 text-green-500" /> : <ShieldOff className="mr-2 size-3 text-orange-500" />}
                      {user.isBlocked ? 'Restore Access' : 'Restrict Chef'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserToDelete(user)}
                      className="rounded-xl size-10 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDelete(userToDelete._id)}
        title="Remove Chef?"
        message={`Are you sure you want to permanently delete @${userToDelete?.username}? This action will remove all their content and cannot be reversed.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
      />
    </div>
  );
};
