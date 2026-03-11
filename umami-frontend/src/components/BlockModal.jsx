import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const BlockModal = ({ isOpen, onClose, onConfirm, username, isBlocking }) => {
  const actionText = isBlocking ? 'Block' : 'Unblock';
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${actionText} ${username}?`}
    >
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          {isBlocking
            ? `Are you sure you want to block ${username}? They will no longer be able to follow you or see your content, and you will not see theirs.`
            : `Are you sure you want to unblock ${username}? You will be able to see each other's content again.`}
        </p>

        <div className="flex items-center space-x-3">
          <Button
            variant={isBlocking ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
          >
            Confirm {actionText}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { BlockModal };
