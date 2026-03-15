import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MessageSquare, Loader2 } from 'lucide-react';

/**
 * Modern shadcn/ui based modal for prompting user input (replaces window.prompt).
 */
export const PromptModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  description,
  label,
  placeholder = "Enter details...",
  defaultValue = "",
  loading = false,
  confirmLabel = "Submit"
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card shadow-2xl rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">{title}</DialogTitle>
              {description && <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleConfirm}>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              {label && (
                <Label htmlFor="prompt-input" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">
                  {label}
                </Label>
              )}
              <Textarea
                id="prompt-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="min-h-[120px] rounded-[1.5rem] bg-muted/30 border-border focus-visible:ring-primary text-base font-medium resize-none leading-relaxed"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest order-2 sm:order-1"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={loading || (typeof value === 'string' && !value.trim())}
              className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
