import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { Modal };
