import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  PlusSquare, 
  Utensils, 
  Settings as SettingsIcon, 
  Bot, 
  Menu, 
  X, 
  Bell, 
  MessageCircle,
  Home,
  Compass,
  User,
  LogOut,
  Sun,
  Moon,
  Soup,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';

const MainLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications');
      const unread = response.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch unread notifications', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      const socket = getSocket();
      if (socket) {
        socket.emit('join', userData?._id || currentUser.uid);
        socket.on('new_notification', () => {
          if (location.pathname !== '/notifications') {
            setUnreadCount(prev => prev + 1);
          }
        });
      }
      return () => {
        if (socket) socket.off('new_notification');
      };
    }
  }, [currentUser, userData, location.pathname]);

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinks = [
    { to: "/", icon: <Home size={20} />, label: "Home" },
    { to: "/explore", icon: <Compass size={20} />, label: "Explore" },
    { to: "/search", icon: <Search size={20} />, label: "Search" },
  ];

  const authLinks = [
    { to: "/create/post", icon: <PlusSquare size={20} />, label: "Post" },
    { to: "/create/recipe", icon: <Utensils size={20} />, label: "Recipe" },
    { to: "/ai-chat", icon: <Bot size={20} />, label: "UmamiBot" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans selection:bg-primary/30 selection:text-primary pb-20 md:pb-0">
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-border py-2" 
          : "bg-background border-transparent py-4"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground transform transition-transform group-hover:rotate-12 duration-300 shadow-lg shadow-primary/20">
              <Soup size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
              UMAMI<span className="opacity-50">CIRCLE</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <div className="flex items-center bg-card/50 border border-border p-1 rounded-2xl mr-4">
              {navLinks.map((link) => (
                <Button 
                  key={link.to} 
                  variant="ghost" 
                  asChild 
                  className={cn(
                    "rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-widest transition-all",
                    location.pathname === link.to 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-secondary hover:text-foreground hover:bg-transparent"
                  )}
                >
                  <Link to={link.to} className="flex items-center space-x-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-2 border-l border-border pl-4">
                {authLinks.map((link) => (
                  <Button 
                    key={link.to} 
                    variant="ghost" 
                    size="icon" 
                    asChild 
                    title={link.label} 
                    className={cn(
                      "rounded-xl h-10 w-10 transition-all",
                      location.pathname === link.to ? "text-primary bg-primary/10" : "text-secondary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Link to={link.to}>
                      {link.icon}
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  </Button>
                ))}
                
                <Link to="/notifications" className="relative" title="Notifications">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-xl h-10 w-10 transition-all",
                      location.pathname === '/notifications' ? "text-primary bg-primary/10" : "text-secondary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Bell size={20} />
                    <span className="sr-only">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge 
                        data-testid="notification-badge"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground font-black text-[10px] border-2 border-background ring-2 ring-primary/20"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link to="/messages" title="Messages">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-xl h-10 w-10 transition-all",
                      location.pathname === '/messages' ? "text-primary bg-primary/10" : "text-secondary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <MessageCircle size={20} />
                    <span className="sr-only">Messages</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border-none ring-2 ring-orange-500 hover:ring-4 transition-all duration-300 overflow-hidden group ml-2">
                      <Avatar className="h-full w-full rounded-full border-none">
                        <AvatarImage src={getCloudinaryUrl(userData?.profilePicUrl, 80, 80)} className="object-cover" />
                        <AvatarFallback className="bg-orange-500 text-white font-black text-xs">
                          {userData?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-[2rem] bg-card/95 backdrop-blur-xl border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-orange-500/20 shadow-xl">
                          <AvatarImage src={getCloudinaryUrl(userData?.profilePicUrl, 150, 150)} />
                          <AvatarFallback className="bg-orange-500 text-white text-xl font-black">{userData?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-base font-black text-foreground leading-none">{userData?.name || userData?.username}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em]">@{userData?.username}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50 mx-4" />
                    <div className="p-2 space-y-1">
                      <DropdownMenuItem asChild className="rounded-2xl focus:bg-orange-500 focus:text-white transition-all p-3.5 cursor-pointer group/item">
                        <Link to={`/u/${userData?.username}`} className="flex items-center font-black uppercase tracking-widest text-[10px]">
                          <User className="mr-3 h-4 w-4" />
                          <span>My Kitchen</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-2xl focus:bg-orange-500 focus:text-white transition-all p-3.5 cursor-pointer group/item">
                        <Link to="/settings" className="flex items-center font-black uppercase tracking-widest text-[10px]">
                          <SettingsIcon className="mr-3 h-4 w-4" />
                          <span>Pantry Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="bg-border/50 mx-4" />
                    <div className="p-2">
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="rounded-2xl text-destructive focus:bg-destructive focus:text-white transition-all p-3.5 cursor-pointer font-black uppercase tracking-widest text-[10px]"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>End Session</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {!currentUser && (
              <div className="flex items-center space-x-3 ml-4 border-l border-border pl-4">
                <Button variant="ghost" asChild className="rounded-xl font-bold hover:text-primary">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                  <Link to="/signup">Join Circle</Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-2 text-secondary hover:text-foreground/60 hover:bg-primary/5 active:text-foreground/80 active:bg-primary/5 transition-all rounded-xl active:scale-90">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-secondary hover:text-primary/70 active:text-primary/80 transition-all rounded-xl active:scale-90">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className={cn(
                "rounded-xl border-border transition-all",
                isMobileMenuOpen ? "bg-primary text-primary-foreground border-primary" : "text-foreground"
              )}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={cn(
          "md:hidden fixed inset-x-0 bg-background/95 backdrop-blur-2xl transition-all duration-500 ease-in-out border-b border-border overflow-hidden",
          isMobileMenuOpen ? "max-h-screen opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        )}>
          <div className="px-6 space-y-2">
            {[
              { to: "/search", icon: <Search size={20} />, label: "Search" },
              { to: "/ai-chat", icon: <Bot size={20} />, label: "UmamiBot" },
            ].map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-[1.25rem] transition-all active:scale-95 border border-transparent",
                  location.pathname === link.to 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-foreground hover:bg-card hover:border-border"
                )}
              >
                <span className={cn(
                  "p-2 rounded-xl",
                  location.pathname === link.to ? "bg-white/20" : "bg-muted"
                )}>
                  {link.icon}
                </span>
                <span className="font-black uppercase tracking-widest text-xs">{link.label}</span>
              </Link>
            ))}
            
            {currentUser ? (
              <div className="pt-4 space-y-2 border-t border-border mt-4">
                <Link to="/notifications" className="flex items-center justify-between p-4 text-foreground bg-card border border-border rounded-[1.25rem] active:scale-95 transition-all">
                  <div className="flex items-center space-x-4">
                    <span className="p-2 bg-muted rounded-xl"><Bell size={20} /></span>
                    <span className="font-black uppercase tracking-widest text-xs">Alerts</span>
                  </div>
                  {unreadCount > 0 && <Badge className="bg-primary font-black px-2">{unreadCount}</Badge>}
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center space-x-4 p-4 text-destructive bg-destructive/5 border border-destructive/10 rounded-[1.25rem] active:scale-95 transition-all text-left">
                  <span className="p-2 bg-destructive/10 rounded-xl"><LogOut size={20} /></span>
                  <span className="font-black uppercase tracking-widest text-xs">Close Session</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border mt-4">
                <Button variant="outline" asChild className="rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] border-border"><Link to="/login">Login</Link></Button>
                <Button asChild className="rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"><Link to="/signup">Join Circle</Link></Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border px-6 py-3 flex justify-between items-center h-16 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <Link to="/" className={cn("p-2 transition-all", location.pathname === "/" ? "text-primary scale-110" : "text-secondary")}>
          <Home size={24} />
        </Link>
        <Link to="/explore" className={cn("p-2 transition-all", location.pathname === "/explore" ? "text-primary scale-110" : "text-secondary")}>
          <Compass size={24} />
        </Link>
        <div className="relative -top-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center">
                <Plus size={28} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 p-2 rounded-2xl bg-card/95 backdrop-blur-xl border-border shadow-2xl mb-4">
              <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer font-bold">
                <Link to="/create/post" className="flex items-center">
                  <PlusSquare className="mr-3 h-4 w-4 text-primary" />
                  <span>New Post</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer font-bold">
                <Link to="/create/recipe" className="flex items-center">
                  <Utensils className="mr-3 h-4 w-4 text-primary" />
                  <span>New Recipe</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link to="/messages" className={cn("p-2 transition-all relative", location.pathname === "/messages" ? "text-primary scale-110" : "text-secondary")}>
          <MessageCircle size={24} />
          <span className="sr-only">Messages</span>
        </Link>
        <Link to={currentUser ? `/u/${userData?.username}` : "/login"} className={cn("p-2 transition-all", location.pathname.startsWith("/u/") ? "text-primary scale-110" : "text-secondary")}>
          <User size={24} />
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export { MainLayout };
