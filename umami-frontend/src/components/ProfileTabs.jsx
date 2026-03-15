import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full flex justify-center py-4">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange && onTabChange(value)} 
        className="w-auto"
      >
        <TabsList className="flex gap-2 bg-muted/30 rounded-full p-1.5 border border-border/50">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "rounded-full px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-center gap-3">
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span 
                    className={cn(
                      "px-2 py-0.5 rounded-full font-black text-[9px] min-w-[20px] text-center",
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export { ProfileTabs };
