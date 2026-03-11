import React from 'react';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
      <nav className="-mb-px flex justify-center min-w-max md:min-w-0 space-x-8 px-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  isActive ? 'bg-orange-100 text-primary dark:bg-orange-900/30' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;
