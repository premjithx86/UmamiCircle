import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

/**
 * Modern shadcn/ui based confirmation dialog (replaces window.confirm).
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  variant = "default"
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-[400px] border-border bg-card shadow-2xl rounded-[2rem] p-8">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className={`size-16 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle size={32} />
          </div>
          <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight italic">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-muted-foreground leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel 
            onClick={onClose}
            className="w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest border-border hover:bg-muted transition-all order-2 sm:order-1"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={`w-full sm:flex-1 rounded-2xl h-12 min-h-[44px] text-base font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 order-1 sm:order-2 ${variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'}`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
