import React from 'react';
import { Layout, Rocket, Settings, Database, Edit, Sparkles, Box } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';

const CMSComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-10">
      <Card className="w-full max-w-4xl border-border bg-card shadow-2xl rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Box size={200} />
        </div>
        
        <CardContent className="p-12 md:p-20 flex flex-col items-center text-center space-y-10">
          <div className="relative">
            <div className="size-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary animate-pulse shadow-lg shadow-primary/5">
              <Layout size={64} />
            </div>
            <div className="absolute -top-4 -right-4 size-14 bg-card rounded-2xl shadow-xl border border-border flex items-center justify-center text-primary animate-bounce">
              <Sparkles size={28} />
            </div>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full text-[10px]">Development Phase</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic">
              Experience Engine
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
              We're architecting a next-generation CMS to orchestrate your landing pages, brand identity, and global communication with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all duration-500">
              <div className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Edit className="text-primary" size={20} />
              </div>
              <h3 className="font-black text-sm text-foreground mb-2 uppercase tracking-tight">Visual Forge</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">State-of-the-art drag-and-drop page architect</p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all duration-500">
              <div className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Database className="text-primary" size={20} />
              </div>
              <h3 className="font-black text-sm text-foreground mb-2 uppercase tracking-tight">Media Vault</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">Centralized high-performance asset ecosystem</p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all duration-500">
              <div className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Settings className="text-primary" size={20} />
              </div>
              <h3 className="font-black text-sm text-foreground mb-2 uppercase tracking-tight">Core Matrix</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">Enterprise-grade global SEO & style orchestration</p>
            </div>
          </div>

          <div className="pt-6">
            <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all cursor-default">
              <Rocket size={18} />
              Launching Soon
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { CMSComingSoon };
