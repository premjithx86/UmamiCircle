import React, { useState, useEffect } from 'react';
import { getPosts, deletePost, getRecipes, deleteRecipe, updateContentStatus, toggleHideContent, updateContentDetails } from '../services/adminService';
import { Search, Trash2, Loader2, Image as ImageIcon, MessageSquare, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Edit3, EyeOff, MoreHorizontal, ExternalLink } from 'lucide-react';
import { AdminEditModal } from '../components/AdminEditModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuGroup,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
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
 * Moderation Queue page for reviewing and managing posts and recipes.
 */
export const ModerationQueue = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let data;
      const params = { search, status: status === 'all' ? '' : status };
      
      if (activeTab === 'posts') {
        data = await getPosts(params);
      } else {
        data = await getRecipes(params);
      }
      
      setItems(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, activeTab]);

  const handleDelete = async (id) => {
    try {
      const itemType = activeTab === 'posts' ? 'post' : 'recipe';
      if (activeTab === 'posts') {
        await deletePost(id);
      } else {
        await deleteRecipe(id);
      }
      setItems(items.filter(item => item._id !== id));
      setItemToDelete(null);
      toast.success(`${itemType} deleted successfully`);
    } catch (err) {
      toast.error(`Failed to delete content`);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const type = activeTab === 'posts' ? 'post' : 'recipe';
      const updatedItem = await updateContentStatus(type, id, newStatus);
      setItems(items.map(item => item._id === id ? { ...item, moderationStatus: updatedItem.moderationStatus } : item));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleHide = async (id, currentHidden) => {
    try {
      const type = activeTab === 'posts' ? 'post' : 'recipe';
      const updatedItem = await toggleHideContent(type, id, !currentHidden);
      setItems(items.map(item => item._id === id ? { ...item, isHidden: updatedItem.isHidden } : item));
      toast.success(`Content is now ${!currentHidden ? 'hidden' : 'visible'}`);
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  const handleUpdateDetails = async (id, updates) => {
    const type = activeTab === 'posts' ? 'post' : 'recipe';
    const updatedItem = await updateContentDetails(type, id, updates);
    setItems(items.map(item => item._id === id ? { ...item, ...updatedItem } : item));
  };

  const openInApp = (id) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    const type = activeTab === 'posts' ? 'posts' : 'recipes';
    window.open(`${frontendUrl}/${type}/${id}`, '_blank');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">Content Lab</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Review and moderate community creations</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-2xl bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="posts" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Posts</TabsTrigger>
            <TabsTrigger value="recipes" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Recipes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative group flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors size-5" />
            <Input
              placeholder={`Search ${activeTab === 'posts' ? 'captions' : 'titles'}...`}
              className="pl-12 h-14 rounded-2xl bg-card border-border shadow-sm focus-visible:ring-primary text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-14 rounded-2xl bg-card border-border shadow-sm focus:ring-primary font-black uppercase tracking-widest text-[10px] px-6">
                <div className="flex items-center gap-3">
                  <Filter size={14} className="text-primary" />
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-card/95 backdrop-blur-xl shadow-2xl">
                <SelectItem value="all" className="rounded-xl focus:bg-primary/10 focus:text-primary font-bold uppercase tracking-widest text-[9px] py-3">All Statuses</SelectItem>
                <SelectItem value="pending" className="rounded-xl focus:bg-primary/10 focus:text-primary font-bold uppercase tracking-widest text-[9px] py-3">Pending</SelectItem>
                <SelectItem value="approved" className="rounded-xl focus:bg-primary/10 focus:text-primary font-bold uppercase tracking-widest text-[9px] py-3">Approved</SelectItem>
                <SelectItem value="flagged" className="rounded-xl focus:bg-primary/10 focus:text-primary font-bold uppercase tracking-widest text-[9px] py-3">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-border bg-card shadow-lg rounded-[2rem] overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Content</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-center">Moderation</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-center">Visibility</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="size-10 text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Scanning the pantry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32 text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">The queue is clean.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item._id} className="hover:bg-muted/20 border-border/50 transition-all duration-300">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-start gap-5 max-w-md">
                          <div className="relative group shrink-0">
                            <div className="size-20 rounded-[1.25rem] bg-muted/50 overflow-hidden border border-border/50 shadow-inner">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              ) : (
                                <div className="size-full flex items-center justify-center text-muted-foreground/30">
                                  <ImageIcon size={24} />
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={() => openInApp(item._id)}
                              size="icon" 
                              variant="secondary"
                              className="absolute -top-2 -right-2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl bg-card border-border"
                            >
                              <ExternalLink size={12} />
                            </Button>
                          </div>
                          <div className="min-w-0 py-1">
                            <p className="font-black text-sm text-foreground tracking-tight leading-snug line-clamp-2 uppercase">
                              {activeTab === 'posts' ? item.caption : item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className="bg-primary/5 border-none text-[8px] font-black px-2 h-5 text-primary">
                                BY @{item.user?.username || 'GHOST'}
                              </Badge>
                              <span className="text-muted-foreground/30">•</span>
                              <CopyableID id={item._id} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6">
                        <div className="flex flex-col items-center gap-3">
                          <Badge 
                            className={cn(
                              "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                              item.moderationStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                              item.moderationStatus === 'flagged' ? 'bg-destructive/10 text-destructive' :
                              'bg-orange-500/10 text-orange-500'
                            )}
                          >
                            {String(item.moderationStatus || 'pending')}
                          </Badge>
                          <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
                            <Button 
                              onClick={() => handleStatusUpdate(item._id, 'approved')}
                              variant="ghost" 
                              size="icon" 
                              className="size-8 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                            >
                              <CheckCircle size={16} />
                            </Button>
                            <Button 
                              onClick={() => handleStatusUpdate(item._id, 'flagged')}
                              variant="ghost" 
                              size="icon" 
                              className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <AlertTriangle size={16} />
                            </Button>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-6">
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleHide(item._id, item.isHidden)}
                            className={cn(
                              "rounded-xl px-4 font-black uppercase tracking-widest text-[9px] transition-all",
                              item.isHidden ? "bg-muted text-muted-foreground" : "border-primary/20 text-primary hover:bg-primary/10"
                            )}
                          >
                            {item.isHidden ? <EyeOff size={12} className="mr-2" /> : <Eye size={12} className="mr-2" />}
                            {String(item.isHidden ? 'Hidden' : 'Visible')}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                            className="rounded-xl size-10 hover:bg-muted"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center justify-center rounded-xl size-10 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <MoreHorizontal size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-border bg-card shadow-2xl w-48">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest opacity-40 px-4 py-3">Advanced Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem onClick={() => openInApp(item._id)} className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold text-xs">
                                  <ExternalLink size={14} className="mr-2" /> View Publicly
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(item._id)} className="rounded-xl p-3 focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold text-xs text-destructive">
                                  <Trash2 size={14} className="mr-2" /> Delete Permanently
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile & Tablet View */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-border/50">
            {loading && items.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-card">
                <Loader2 className="size-10 text-primary animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4 animate-pulse">Scanning the pantry...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-card">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">The queue is clean.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="p-6 bg-card space-y-6">
                  <div className="flex gap-4">
                    <div className="size-24 rounded-2xl bg-muted/50 overflow-hidden border border-border/50 shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground/30">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge 
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none mb-2",
                          item.moderationStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                          item.moderationStatus === 'flagged' ? 'bg-destructive/10 text-destructive' :
                          'bg-orange-500/10 text-orange-500'
                        )}
                      >
                        {String(item.moderationStatus || 'pending')}

                      </Badge>
                      <p className="font-black text-sm uppercase tracking-tight line-clamp-2 leading-tight">
                        {activeTab === 'posts' ? item.caption : item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">@{item.user?.username || 'GHOST'}</p>
                        <span className="text-muted-foreground/30">•</span>
                        <CopyableID id={item._id} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStatusUpdate(item._id, 'approved')}
                      className="flex-1 rounded-xl h-11 font-black uppercase tracking-widest text-[9px] bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border-none shadow-none"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(item._id, 'flagged')}
                      variant="destructive"
                      className="flex-1 rounded-xl h-11 font-black uppercase tracking-widest text-[9px] shadow-none"
                    >
                      Flag
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleHide(item._id, item.isHidden)}
                      className={cn(
                        "rounded-lg font-black uppercase tracking-widest text-[8px] h-8",
                        item.isHidden ? "text-muted-foreground" : "text-primary"
                      )}
                    >
                      {item.isHidden ? <EyeOff size={12} className="mr-2" /> : <Eye size={12} className="mr-2" />}
                      {String(item.isHidden ? 'Hidden' : 'Visible')}
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingItem(item)} className="size-8 rounded-lg"><Edit3 size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openInApp(item._id)} className="size-8 rounded-lg"><ExternalLink size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item._id)} className="size-8 rounded-lg text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {editingItem && (
        <AdminEditModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          type={activeTab === 'posts' ? 'post' : 'recipe'}
          onUpdate={handleUpdateDetails}
        />
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => handleDelete(itemToDelete)}
        title={`Delete ${activeTab === 'posts' ? 'Post' : 'Recipe'}?`}
        message={`Are you sure you want to permanently delete this ${activeTab === 'posts' ? 'post' : 'recipe'}? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
      />
    </div>
  );
};
