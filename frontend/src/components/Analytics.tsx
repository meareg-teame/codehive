import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v1Analytics, v1Projects } from "@/api";
import { isUnauthorizedError, getStoredAccessToken } from "@/api/client";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Clock,
  Code,
  Play,
  Calendar,
  TrendingUp,
  FileCode,
  Activity,
  Cpu,
  Layers
} from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function Analytics() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [personalStats, setPersonalStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<any>(null);

  useEffect(() => {
    document.title = "Intelligence Protocol - CodeHive";
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!getStoredAccessToken()) {
      setLoading(false);
      return;
    }

    try {
      const stats = await v1Analytics.getOverview();
      setPersonalStats(stats);

      const projectList = await v1Projects.listProjects();
      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProject(projectList[0]._id);
      }

      setLoading(false);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        navigate("/auth");
      }
      setLoading(false);
    }
  };

  const fetchProjectAnalytics = async (projectId: string) => {
    if (!getStoredAccessToken()) return;

    try {
      const data = await v1Analytics.getProjectAnalytics(projectId);
      setProjectAnalytics(data);
    } catch (error) {
      console.error("Error fetching project analytics:", error);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchProjectAnalytics(selectedProject);
    }
  }, [selectedProject]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
    <div className="flex min-h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
             <Activity className="w-4 h-4 text-primary" />
             <h2 className="text-xs font-black uppercase tracking-widest italic">Intelligence Protocol</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
           <Skeleton className="h-12 w-64 rounded-2xl bg-white/5" />
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem] bg-white/5" />)}
           </div>
           <Skeleton className="h-[400px] w-full rounded-[2rem] bg-white/5" />
          </div>
        </main>
      </div>
    </div>
    );
  }

  return (
    <div className="flex min-h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-5 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-[800px] h-[500px] bg-primary/10 blur-[180px] rounded-full pointer-events-none -mt-48 animate-pulse" />

        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0 relative z-20">
          <div className="flex items-center gap-4">
             <div className="md:hidden">
               <MobileSidebar />
             </div>
             <Activity className="w-4 h-4 text-primary" />
             <h2 className="text-xs font-black uppercase tracking-widest italic">Intelligence Protocol</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto space-y-12">
            {!getStoredAccessToken() && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-100/90">
                Analytics uses the v1 API and requires a Bearer token (Firebase sign-in).
                Guest and legacy cookie sessions can use the dashboard and editor; sign in with
                Firebase to enable charts here.
              </div>
            )}
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Stream</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">System <span className="text-primary">Intelligence</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Neural analytics and infrastructure performance metrics</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Active Sessions", value: personalStats?.totalSessions || 0, icon: Calendar, color: "text-blue-400" },
                { title: "Uptime Sync", value: formatDuration(personalStats?.totalTimeInSessions || 0), icon: Clock, color: "text-emerald-400" },
                { title: "Primary Stack", value: personalStats?.mostUsedLanguage || "N/A", icon: Code, color: "text-amber-400" },
                { title: "Binary Execs", value: personalStats?.totalExecutions || 0, icon: Play, color: "text-purple-400" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] glass hover:border-primary/30 transition-all group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[oklch(0.8_0.2_210)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">{stat.title}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color} opacity-60 group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div className="text-3xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left uppercase text-foreground">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <section className="space-y-8 pt-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary" />
                  Project Intelligence
                </h2>
                <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[300px] h-12 bg-background/40 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 focus:ring-primary/20">
                    <SelectValue placeholder="Protocol Switch" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10 rounded-2xl p-2 shadow-2xl">
                    {projects.map((project) => (
                      <SelectItem 
                        key={project._id} 
                        value={project._id}
                        className="rounded-xl text-[10px] font-black uppercase tracking-widest p-3 focus:bg-primary focus:text-primary-foreground italic transition-all"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AnimatePresence mode="wait">
                {projectAnalytics && (
                  <motion.div
                    key={selectedProject}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    <div className="lg:col-span-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { l: "Total Ops", v: projectAnalytics.totalSessions, i: Activity },
                          { l: "Mean Runtime", v: formatDuration(projectAnalytics.avgSessionDuration), i: Clock },
                          { l: "Stack Root", v: Object.keys(projectAnalytics.languageDistribution)[0] || "N/A", i: Layers }
                        ].map((stat, i) => (
                          <div key={i} className="p-6 rounded-[1.5rem] glass space-y-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="flex items-center gap-2 relative z-10">
                                <stat.i className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.l}</span>
                            </div>
                            <div className="text-xl font-black uppercase relative z-10 text-foreground">{stat.v}</div>
                          </div>
                        ))}
                      </div>

                      <Card className="rounded-[2rem] glass overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/10">
                          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic text-muted-foreground flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Session Flux Propagation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={projectAnalytics.sessionsOverTime}>
                                <defs>
                                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="date" stroke="#ffffff10" tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis stroke="#ffffff10" tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 'bold' }} />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#101014', border: '1px solid #ffffff05', borderRadius: '16px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                  itemStyle={{ color: 'var(--primary)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                      <Card className="rounded-[2rem] glass overflow-hidden h-full shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/10">
                          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic text-muted-foreground flex items-center gap-3">
                            <FileCode className="h-4 w-4 text-primary" />
                            Logic Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(projectAnalytics.languageDistribution).map(([name, value]) => ({ name, value }))}
                                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                >
                                  {Object.entries(projectAnalytics.languageDistribution).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#101014', border: '1px solid #ffffff05', borderRadius: '16px', fontSize: '10px', fontWeight: '900' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-3 mt-4">
                            {Object.entries(projectAnalytics.languageDistribution).map(([name, value]: any, i) => (
                              <div key={i} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-black uppercase italic group-hover:text-primary transition-colors">{name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground opacity-50">{value} units</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {projectAnalytics.memberContributions.length > 0 && (
                      <div className="lg:col-span-12">
                          <Card className="rounded-[2rem] glass overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-3 bg-background/40 px-10 py-6 border-b border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-muted-foreground/70">Contributor Identity</span>
                                <span className="text-center text-[10px] font-black uppercase tracking-[0.3em] italic text-muted-foreground/70">Impact Flux</span>
                                <span className="text-right text-[10px] font-black uppercase tracking-[0.3em] italic text-muted-foreground/70">Protocol Rank</span>
                            </div>
                            <div className="divide-y divide-white/10">
                                {projectAnalytics.memberContributions.map((member: any, i: number) => (
                                  <div key={i} className="grid grid-cols-3 items-center px-10 py-8 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-accent/30 flex items-center justify-center text-sm font-black italic group-hover:scale-110 transition-transform">
                                          {member.userName[0].toUpperCase()}
                                        </div>
                                        <span className="font-black uppercase italic text-lg tracking-tighter group-hover:text-primary transition-colors">{member.userName}</span>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase italic shadow-lg shadow-primary/5">
                                          {member.linesContributed.toLocaleString()} Bytes Written
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        {i === 0 && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest italic">Prime Contributor</Badge>}
                                        <Badge variant="outline" className="text-[9px] font-black uppercase italic opacity-40">Rank {i + 1}</Badge>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </Card>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
                Intelligence Protocol v2.4.0 · CodeHive Collaborative Systems
              </footer>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Analytics;
