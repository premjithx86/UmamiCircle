import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/adminService';
import { Users, FileText, Activity, AlertCircle, RefreshCw, Globe, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

/**
 * Dashboard page displaying platform metrics and demographic charts.
 */
export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Mock data for demographic chart (Top Countries)
  const countryData = [
    { name: 'USA', users: 4500, color: '#FF6B35' },
    { name: 'India', users: 3200, color: '#f97316' },
    { name: 'UK', users: 2100, color: '#fb923c' },
    { name: 'Canada', users: 1800, color: '#fdba74' },
    { name: 'Australia', users: 1200, color: '#fed7aa' },
  ];

  // Mock data for activity line chart
  const activityData = [
    { name: 'Mon', posts: 40, recipes: 24 },
    { name: 'Tue', posts: 30, recipes: 13 },
    { name: 'Wed', posts: 20, recipes: 98 },
    { name: 'Thu', posts: 27, recipes: 39 },
    { name: 'Fri', posts: 18, recipes: 48 },
    { name: 'Sat', posts: 23, recipes: 38 },
    { name: 'Sun', posts: 34, recipes: 43 },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[450px] rounded-[2.5rem]" />
          <Skeleton className="h-[450px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Alert variant="destructive" className="rounded-3xl border-destructive/20 bg-destructive/5 p-6">
          <AlertCircle className="size-5" />
          <AlertTitle className="text-lg font-black uppercase tracking-tight ml-2">Dashboard Error</AlertTitle>
          <AlertDescription className="mt-2 ml-2 font-medium opacity-80">
            {error}
          </AlertDescription>
          <Button onClick={fetchStats} variant="outline" className="mt-6 rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive font-black uppercase tracking-widest text-[10px]">
            <RefreshCw className="mr-2 size-3" /> Retry Connection
          </Button>
        </Alert>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-primary/10 text-primary' },
    { title: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Total Recipes', value: stats?.totalRecipes || 0, icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
    { title: 'Daily Activity', value: stats?.dailyPosts || 0, icon: Activity, color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">Platform Analytics</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-[10px]">Real-time platform metrics and growth insights</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchStats}
          className="rounded-full size-12 border-border hover:bg-muted hover:text-primary transition-all shadow-sm"
        >
          <RefreshCw className="size-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`${card.color} size-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <card.icon className="size-7" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{card.title}</p>
                <p className="text-3xl font-black text-foreground tracking-tighter mt-1">{card.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Countries Bar Chart */}
        <Card className="rounded-[2.5rem] border-border bg-card shadow-lg overflow-hidden">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Globe size={22} />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight italic">Top Countries</CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest">Global user distribution by region</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div style={{ width: '100%', minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={countryData} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" width={60} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '1.5rem', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Bar dataKey="users" radius={[0, 12, 12, 0]} barSize={32}>
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity Line Chart */}
        <Card className="rounded-[2.5rem] border-border bg-card shadow-lg overflow-hidden">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Activity size={22} />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight italic">Engagement Trends</CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest">Weekly content creation volume</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div style={{ width: '100%', minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '1.5rem', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      padding: '12px 16px'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                  <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="recipes" stroke="#FF6B35" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
