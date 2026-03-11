import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ShareModal = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const platforms = [
    { name: 'Twitter', icon: '🐦', color: 'bg-[#1DA1F2]' },
    { name: 'Facebook', icon: '👤', color: 'bg-[#1877F2]' },
    { name: 'WhatsApp', icon: '💬', color: 'bg-[#25D366]' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share">
      <div className="space-y-6" data-testid="share-modal">
        {/* Social Platforms */}
        <div className="flex justify-around">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              aria-label={`Share on ${platform.name}`}
              className={`w-12 h-12 rounded-full ${platform.color} text-white flex items-center justify-center text-xl hover:scale-110 transition-transform`}
            >
              {platform.icon}
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy link</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              className="whitespace-nowrap min-w-[80px]"
              variant={copied ? 'secondary' : 'primary'}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
