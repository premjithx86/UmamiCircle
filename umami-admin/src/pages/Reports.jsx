import React, { useState, useEffect } from 'react';
import { getReports, updateReport, takeReportAction } from '../services/adminService';
import { AlertCircle, Search, Filter, Loader2, CheckCircle, XCircle, Clock, MessageSquare, ExternalLink, Trash2, EyeOff, Eye, Send, MoreHorizontal, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/skeleton';
import { WarnUserModal } from '../components/WarnUserModal';
import { PromptModal } from '../components/PromptModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';
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
 * Reports page for managing user-submitted reports.
 */
export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [targetType, setTargetType] = useState('all');
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWarnModalOpen, setIsWarnModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingActionReportId, setPendingActionReportId] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports({ 
        status: status === 'all' ? '' : status, 
        targetType: targetType === 'all' ? '' : targetType 
      });
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status, targetType]);

  const handleUpdateStatusClick = (reportId, newStatus) => {
    setPendingActionReportId(reportId);
    setPendingStatus(newStatus);
    setIsPromptModalOpen(true);
  };

  const handleUpdateStatus = async (reportId, newStatus, adminComment = "") => {
    try {
      setIsProcessing(true);
      const updated = await updateReport(reportId, { status: newStatus, adminComment });
      setReports(reports.map(r => r._id === reportId ? updated : r));
      if (selectedReport?._id === reportId) {
        setSelectedReport(updated);
      }
      toast.success(`Report ${newStatus.replace('_', ' ')} successfully`);
      setIsPromptModalOpen(false);
    } catch (err) {
      toast.error('Failed to update report');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (reportId, action) => {
    setPendingActionReportId(reportId);
    setPendingActionType(action);
    
    if (action === 'warn') {
      setIsWarnModalOpen(true);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handleWarnConfirm = (message) => {
    handleTakeAction(pendingActionReportId, 'warn', message);
    setIsWarnModalOpen(false);
  };

  const handleTakeAction = async (reportId, action, warnMessage = '') => {
    try {
      setIsProcessing(true);
      const res = await takeReportAction(reportId, action, warnMessage);
      // Update local report status
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'action_taken' } : r));
      if (selectedReport?._id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: 'action_taken' }));
      }
      setIsConfirmModalOpen(false);
      toast.success(res.message || `Action ${action} applied successfully`);
    } catch (err) {
      toast.error(`Failed to apply action: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openTargetInApp = (type, id) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    const route = type.toLowerCase() === 'user' ? 'u' : type.toLowerCase() === 'post' ? 'posts' : 'recipes';
    window.open(`${frontendUrl}/${route}/${id}`, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'action_taken':
        return <Badge className="bg-green-500/10 text-green-500 border-none rounded-lg px-2 text-[8px] font-black uppercase"><CheckCircle className="mr-1 size-2.5" /> Action Taken</Badge>;
      case 'dismissed':
        return <Badge className="bg-muted text-muted-foreground border-none rounded-lg px-2 text-[8px] font-black uppercase"><XCircle className="mr-1 size-2.5" /> Dismissed</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/10 text-blue-500 border-none rounded-lg px-2 text-[8px] font-black uppercase"><Eye className="mr-1 size-2.5" /> Reviewed</Badge>;
      default:
        return <Badge className="bg-orange-500/10 text-orange-500 border-none rounded-lg px-2 text-[8px] font-black uppercase"><Clock className="mr-1 size-2.5" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">Safety Center</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Review and resolve user-submitted reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-48">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-2xl bg-card border-border shadow-sm focus:ring-primary font-black uppercase tracking-widest text-[9px] px-4">
                  <div className="flex items-center gap-2">
                    <Filter size={12} className="text-primary" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
                  <SelectItem value="all" className="rounded-xl font-bold uppercase text-[9px]">All Statuses</SelectItem>
                  <SelectItem value="pending" className="rounded-xl font-bold uppercase text-[9px]">Pending</SelectItem>
                  <SelectItem value="reviewed" className="rounded-xl font-bold uppercase text-[9px]">Reviewed</SelectItem>
                  <SelectItem value="dismissed" className="rounded-xl font-bold uppercase text-[9px]">Dismissed</SelectItem>
                  <SelectItem value="action_taken" className="rounded-xl font-bold uppercase text-[9px]">Action Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger className="h-12 rounded-2xl bg-card border-border shadow-sm focus:ring-primary font-black uppercase tracking-widest text-[9px] px-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={12} className="text-primary" />
                    <SelectValue placeholder="Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
                  <SelectItem value="all" className="rounded-xl font-bold uppercase text-[9px]">All Types</SelectItem>
                  <SelectItem value="User" className="rounded-xl font-bold uppercase text-[9px]">User</SelectItem>
                  <SelectItem value="Post" className="rounded-xl font-bold uppercase text-[9px]">Post</SelectItem>
                  <SelectItem value="Recipe" className="rounded-xl font-bold uppercase text-[9px]">Recipe</SelectItem>
                  <SelectItem value="Comment" className="rounded-xl font-bold uppercase text-[9px]">Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-border bg-card shadow-lg rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Target</TableHead>
                    <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest">Reason</TableHead>
                    <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && reports.length === 0 ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4} className="p-6"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                      </TableRow>
                    ))
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow 
                        key={report._id} 
                        className={cn(
                          "hover:bg-muted/20 border-border/50 transition-all cursor-pointer",
                          selectedReport?._id === report._id && "bg-primary/5"
                        )}
                        onClick={() => setSelectedReport(report)}
                      >
                        <TableCell className="px-6 py-4">
                          <p className="font-black text-xs uppercase tracking-tight text-foreground">{report.targetType}</p>
                          <CopyableID id={report.targetId} className="mt-1" />
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-[200px]">{String(report.reason || '')}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(String(report.status || 'pending'))}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="rounded-xl size-8">
                            <MoreHorizontal size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedReport ? (
            <Card className="border-primary/20 bg-card shadow-xl rounded-[2.5rem] overflow-hidden sticky top-24 animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="p-8 border-b border-border/50 bg-primary/5">
                <div className="flex items-start justify-between">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <MessageSquare size={24} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="rounded-full text-muted-foreground hover:bg-muted"><XCircle size={20} /></Button>
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight italic mt-6">Resolution Desk</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-[10px] uppercase tracking-widest text-primary">{selectedReport.targetType} Content &bull;</span>
                  <CopyableID id={selectedReport._id} className="text-primary" />
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Reporter's Note</p>
                  <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                    <p className="text-sm font-medium leading-relaxed italic">"{selectedReport.reason}"</p>
                    <p className="text-[9px] font-black text-primary uppercase mt-4">BY @{selectedReport.reporter?.username || 'ANONYMOUS'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Enforcement Actions</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => openTargetInApp(selectedReport.targetType, selectedReport.targetId)}
                      className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-[9px] border-border hover:bg-muted"
                    >
                      <ExternalLink className="mr-2 size-3.5" /> View Live Content
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => handleActionClick(selectedReport._id, 'warn')}
                        className="rounded-xl h-12 font-black uppercase tracking-widest text-[9px] bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-none shadow-none"
                      >
                        <Send className="mr-2 size-3.5" /> Warn User
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleTakeAction(selectedReport._id, 'hide')}
                        className="rounded-xl h-12 font-black uppercase tracking-widest text-[9px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-none"
                      >
                        <EyeOff className="mr-2 size-3.5" /> Hide
                      </Button>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleTakeAction(selectedReport._id, 'delete')}
                      className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-destructive/20"
                    >
                      <Trash2 className="mr-2 size-3.5" /> Nuking Post
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-8 border-t border-border/50 bg-muted/10 flex flex-col gap-3">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleUpdateStatusClick(selectedReport._id, 'dismissed')}
                    className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11"
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleUpdateStatusClick(selectedReport._id, 'reviewed')}
                    className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 text-blue-500 hover:bg-blue-500/5 hover:text-blue-600"
                  >
                    Review
                  </Button>
                </div>
                <Button 
                  onClick={() => handleUpdateStatusClick(selectedReport._id, 'action_taken')}
                  className="w-full rounded-xl font-black uppercase tracking-widest text-[9px] h-12 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle className="mr-2 size-3.5" /> Finalize Resolution
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-[2.5rem] opacity-30 text-center space-y-4">
              <ShieldAlert size={48} className="text-muted-foreground" />
              <p className="text-xs font-black uppercase tracking-widest">Select a report from the list to begin resolution</p>
            </div>
          )}
        </div>
      </div>

      <WarnUserModal 
        isOpen={isWarnModalOpen}
        onClose={() => setIsWarnModalOpen(false)}
        onConfirm={handleWarnConfirm}
        loading={isProcessing}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onConfirm={(val) => handleUpdateStatus(pendingActionReportId, pendingStatus, val)}
        title="Add Resolution Comment"
        description={`Set an internal admin comment for this ${pendingStatus?.replace('_', ' ')} action.`}
        label="Admin Comment"
        placeholder="Reason for this resolution..."
        loading={isProcessing}
        confirmLabel="Save & Update Status"
      />

      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => handleTakeAction(pendingActionReportId, pendingActionType)}
        title={`${pendingActionType?.charAt(0).toUpperCase()}${pendingActionType?.slice(1)} Content?`}
        message={`Are you sure you want to apply the ${pendingActionType} action to this content? This may affect the content's visibility or the user's standing.`}
        confirmLabel={`Apply ${pendingActionType}`}
        variant={pendingActionType === 'delete' ? 'destructive' : 'default'}
      />
    </div>
  );
};
