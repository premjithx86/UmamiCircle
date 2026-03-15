import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/adminService';
import { Search, Filter, Loader2, History, User, Calendar, Shield, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';
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
 * Activity Logs page for reviewing administrative actions.
 */
export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs({ adminId, action });
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [adminId, action]);

  const getActionBadge = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete')) return <Badge className="bg-destructive/10 text-destructive border-none text-[8px] font-black uppercase">Deleted</Badge>;
    if (actionLower.includes('update')) return <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px] font-black uppercase">Updated</Badge>;
    if (actionLower.includes('block')) return <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black uppercase">Blocked</Badge>;
    if (actionLower.includes('unblock')) return <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase">Unblocked</Badge>;
    return <Badge variant="secondary" className="border-none text-[8px] font-black uppercase">{action}</Badge>;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">Ledger</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Immutable record of administrative actions</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
          <Input
            placeholder="Search by Admin ID or Action..."
            className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm focus-visible:ring-primary text-sm font-medium"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border bg-card shadow-lg rounded-[2.5rem] overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Administrator</TableHead>
                <TableHead className="py-5 text-[9px] font-black uppercase tracking-widest">Operation</TableHead>
                <TableHead className="py-5 text-[9px] font-black uppercase tracking-widest">Timestamp</TableHead>
                <TableHead className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logs.length === 0 ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="p-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
                    No activity recorded
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-muted/20 border-border/50 transition-all duration-300">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <Shield size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs uppercase tracking-tight text-foreground">Admin Session</p>
                          <CopyableID id={log.adminId} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                      <TableCell className="px-8 py-6">
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic max-w-md">
                          {typeof log.details === 'object' && log.details !== null ? JSON.stringify(log.details) : String(log.details || 'No additional parameters recorded')}
                        </p>
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border/50">
          {loading && logs.length === 0 ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
              No activity recorded
            </div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Administrator</p>
                      <CopyableID id={log.adminId} className="mt-0.5" />
                    </div>
                  </div>
                  {getActionBadge(log.action)}
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Operation Details</p>
                  <p className="text-xs font-medium italic">
                    "{typeof log.details === 'object' && log.details !== null ? JSON.stringify(log.details) : String(log.details || 'System automated task')}"
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  <Clock size={10} />
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
