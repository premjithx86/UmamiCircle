import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // I need to install textarea or use a custom one. I'll check if it exists.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Modal for editing post or recipe details by admin.
 */
export const AdminEditModal = ({ isOpen, onClose, item, type, onUpdate }) => {
  const [formData, setFormData] = useState({
    caption: '',
    title: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        caption: item.caption || '',
        title: item.title || '',
        description: item.description || '',
        tags: item.tags ? item.tags.join(', ') : '',
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updates = { ...formData };
      updates.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      await onUpdate(item._id, updates);
      onClose();
      toast.success('Details updated successfully');
    } catch (err) {
      toast.error('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border bg-card shadow-2xl rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="p-8 border-b border-border/50 bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Edit3 size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Refine Content</DialogTitle>
              <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Adjust details for ID: {item._id.substring(0, 12)}...</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            {type === 'post' ? (
              <div className="space-y-2.5">
                <Label htmlFor="caption" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Caption</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="min-h-[100px] rounded-2xl bg-muted/30 border-border focus-visible:ring-primary text-base font-medium"
                  placeholder="What's cooking?"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Recipe Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-14 min-h-[44px] rounded-2xl bg-muted/30 border-border focus-visible:ring-primary text-base font-medium"
                    placeholder="Grandma's Secret Pasta..."
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] rounded-2xl bg-muted/30 border-border focus-visible:ring-primary text-base font-medium"
                    placeholder="Tell us about this dish..."
                  />
                </div>
              </>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Culinary Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="h-14 min-h-[44px] rounded-2xl bg-muted/30 border-border focus-visible:ring-primary text-base font-medium"
                placeholder="spicy, vegan, italian..."
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest order-2 sm:order-1"
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : 'Commit Updates'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
