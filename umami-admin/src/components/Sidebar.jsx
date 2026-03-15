import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertCircle, 
  LogOut, 
  History,
  Layout,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

const Sidebar = ({ isMobile }) => {
  const { logout, admin } = useAdmin();
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Content Moderation', path: '/content', icon: FileText },
    { name: 'Reports', path: '/reports', icon: AlertCircle },
    { name: 'Activity Logs', path: '/logs', icon: History },
    { name: 'CMS', path: '/cms', icon: Layout },
  ];

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      isMobile ? "w-full border-none" : collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
        <div className={cn("flex items-center gap-3", collapsed && !isMobile && "hidden")}>
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Layout size={18} />
          </div>
          <span className="text-lg font-black tracking-tighter text-foreground uppercase">Umami</span>
        </div>
        
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex rounded-full text-muted-foreground hover:text-primary"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/30" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && !isMobile && "justify-center px-0 h-12 w-12 mx-auto"
              )}
            >
              <Icon size={20} className={cn("shrink-0", !collapsed || isMobile ? "" : "m-0")} />
              {(!collapsed || isMobile) && <span className="uppercase tracking-widest text-[10px]">{item.name}</span>}
            </NavLink>
          );

          if (collapsed && !isMobile) {
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  {link}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-lg shadow-xl">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 shadow-sm", collapsed && !isMobile && "justify-center p-2")}>
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
            {admin?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-tight truncate leading-none">{admin?.username || 'Admin'}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">{admin?.role || 'Staff'}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 mt-3 text-destructive font-black uppercase tracking-widest text-[10px] hover:bg-destructive/5 rounded-2xl transition-all group",
            collapsed && !isMobile && "justify-center px-0 h-12 w-12 mx-auto"
          )}
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return sidebarContent;
};

export { Sidebar };
