import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable confirmation modal matching UmamiCircle design.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {string} props.title - Modal title
 * @param {string} props.message - Descriptive message
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Function} props.onCancel - Cancel action handler
 * @param {string} [props.confirmLabel='Confirm'] - Label for the orange action button
 * @param {string} [props.cancelLabel='Cancel'] - Label for the grey cancel button
 * @param {boolean} [props.loading=false] - Loading state for confirm button
 * @param {string} [props.variant='default'] - 'default' or 'destructive'
 */
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'default'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onCancel()}>
      <DialogContent className="bg-card border-border shadow-2xl rounded-[2rem] max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 text-center">
          <p className="text-muted-foreground font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] border-border hover:bg-muted/50 transition-all"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmModal };
