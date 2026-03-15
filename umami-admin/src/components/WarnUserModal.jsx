import React, { useState } from 'react';
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
import { AlertCircle, Send, Loader2 } from 'lucide-react';

/**
 * Modern shadcn/ui based modal for sending warnings to users.
 */
export const WarnUserModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  defaultMessage = "A formal warning has been issued regarding your content. Please review community guidelines.",
  loading = false
}) => {
  const [message, setMessage] = useState(defaultMessage);

  const handleConfirm = () => {
    onConfirm(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card shadow-2xl rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <AlertCircle size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Issue User Warning</DialogTitle>
              <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-primary mt-1">Formal notice for community guideline violations</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="warning-message" className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">
              Warning Statement
            </Label>
            <Textarea
              id="warning-message"
              placeholder="Enter details regarding the violation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] rounded-[1.5rem] bg-muted/30 border-border focus-visible:ring-primary text-base font-medium resize-none leading-relaxed"
              disabled={loading}
            />
          </div>
          
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-3 items-start">
            <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium text-orange-600/80 leading-relaxed">
              This message will be sent directly to the user's notifications. Ensure the tone is professional and clearly identifies the issue.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest order-2 sm:order-1"
          >
            Discard
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !message.trim()}
            className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all order-1 sm:order-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 size-3.5" /> 
                Dispatch Warning
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
