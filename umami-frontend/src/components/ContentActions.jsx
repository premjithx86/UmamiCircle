import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ContentActions = ({ 
  authorId, 
  onEdit, 
  onDelete, 
  onReport,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useAuth();
  const menuRef = useRef(null);

  const isAuthor = userData?._id && authorId && userData._id.toString() === authorId.toString();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
        aria-label="Actions"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {isAuthor ? (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    onEdit();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3 transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit Content</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  onReport();
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-3 transition-colors"
              >
                <Flag size={16} />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
