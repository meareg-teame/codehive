import { useEffect, useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { legacyProjects } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import { useSocketOptional } from "@/app/providers/SocketProvider";
import { SOCKET_EVENTS } from "@/realtime/events";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShieldCheck, UserPlus, Clock, CheckCircle2, AlertCircle } from "lucide-react";

import type { AccessRequestProject } from "@/types";

function AccessManagement() {
  const navigate = useNavigate();
  const socket = useSocketOptional();
  const [accessManagementProjects, setAccessManagementProjects] = useState<AccessRequestProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Access Protocol - CodeCollab";
    legacyProjects
      .getAccessManagement()
      .then((projects) => {
        setAccessManagementProjects([...projects].reverse());
      })
      .catch((e) => {
        if (isUnauthorizedError(e)) navigate("/auth");
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return (
    <div className="flex min-h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-4">
             <div className="md:hidden">
               <MobileSidebar />
             </div>
             <ShieldCheck className="w-4 h-4 text-primary" />
             <h2 className="text-xs font-black uppercase tracking-widest italic">Access Protocol</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <Toaster position="bottom-right" />
          <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -mt-48" />
          
          <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
            <ShieldCheck className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Security Protocol</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Access <span className="text-primary">Registry</span></h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Manage permissions and infrastructure requests</p>
        </header>

        <section className="rounded-[2rem] glass overflow-hidden relative z-10 shadow-2xl">
          <div className="grid grid-cols-3 bg-background/40 px-8 py-5 border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic">Project Identifier</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic text-center">Requester Identity</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic text-right">Clearance Status</span>
          </div>

          <div className="divide-y divide-white/10 min-h-[400px]">
            {isLoading ? (
               <div className="h-full flex items-center justify-center p-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
               </div>
            ) : accessManagementProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 space-y-4"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-3xl flex items-center justify-center opacity-20">
                   <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black uppercase italic text-muted-foreground/40">No pending handshakes</h3>
              </motion.div>
            ) : (
              <AnimatePresence>
                {accessManagementProjects.map((project, idx) => (
                  <motion.div
                    key={`${project.projectId}-${project.requestedBy}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-3 items-center px-8 py-6 hover:bg-white/5 transition-all duration-300 border-white/10 group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase italic group-hover:text-primary transition-colors">{project.projectName}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">{project.projectId}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-[10px] font-black italic">
                          {project.requestedBy[0].toUpperCase()}
                       </div>
                       <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{project.requestedBy}</span>
                    </div>

                    <div className="flex justify-end">
                      {project.status === "granted" ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter italic">Access Authorized</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setAccessManagementProjects((current) =>
                              current.map((p) =>
                                p.projectId === project.projectId && p.requestedBy === project.requestedBy
                                  ? { ...p, status: "granted" }
                                  : p
                              )
                            );
                            socket?.emit(SOCKET_EVENTS.grantProjectAccess, {
                              projectId: project.projectId,
                              requestedBy: project.requestedBy,
                            });
                            toast.success(`Access granted for ${project.projectName}`);
                          }}
                          className="h-9 px-6 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.8_0.2_210)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
                        >
                          <UserPlus className="w-3 h-3 mr-2 text-white" />
                          Authorize
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>

        <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
          Access Protocol v2.4.0 · CodeCollab Collaborative Systems
        </footer>
      </main>
    </div>
  </div>
  );
}

export default AccessManagement;
