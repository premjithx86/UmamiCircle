import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Sidebar } from './Sidebar';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border shadow-2xl">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-black tracking-tighter text-primary">UMAMI ADMIN</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* This space can be used for breadcrumbs or other info */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full text-muted-foreground hover:text-primary transition-all"
          >
            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
