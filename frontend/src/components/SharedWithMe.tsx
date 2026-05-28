import { useEffect, useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { legacyProjects } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Toaster } from "sonner";
import { Users, Share2, ExternalLink, Trash2, ShieldAlert } from "lucide-react";

type SharedProject = {
  _id: string;
  name: string;
  owner: string;
};

function SharedWithMe() {
  const navigate = useNavigate();
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Collaborative Projects - CodeHive";
    legacyProjects
      .getSharedWithMe()
      .then((projects) => {
        setSharedProjects([...projects].reverse());
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
             <Share2 className="w-4 h-4 text-primary" />
             <h2 className="text-xs font-black uppercase tracking-widest italic">Shared Workspace</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Toaster position="bottom-right" />
          
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full pointer-events-none -mt-48 -mr-48 animate-pulse" />
          
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Collaborative Clusters</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Shared <span className="text-primary">Workspace</span></h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">External environments shared with your identity</p>
        </header>

        <section className="rounded-[2rem] glass overflow-hidden relative z-10 shadow-2xl">
          <div className="grid grid-cols-12 bg-background/40 px-8 py-5 border-b border-white/10">
            <span className="col-span-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic">Project Identifier</span>
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic">Origin Owner</span>
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 italic text-right">Access Controls</span>
          </div>

          <div className="divide-y divide-white/10 min-h-[400px]">
            {isLoading ? (
               <div className="h-full flex items-center justify-center p-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
               </div>
            ) : sharedProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 space-y-4"
              >
                <div className="w-16 h-16 bg-accent/20 rounded-3xl flex items-center justify-center opacity-20">
                   <Share2 className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black uppercase italic text-muted-foreground/40">No external handshakes found</h3>
              </motion.div>
            ) : (
              <AnimatePresence>
                {sharedProjects.map((project, idx) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-12 items-center px-8 py-6 hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="col-span-6 space-y-1">
                      <h4 className="font-black text-lg uppercase italic group-hover:text-primary transition-colors tracking-tighter">{project.name}</h4>
                      <div className="flex gap-2">
                         <Badge variant="outline" className="text-[8px] border-white/10 uppercase font-bold text-muted-foreground bg-white/5">{project._id}</Badge>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center gap-3">
                       <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black italic text-primary">
                          {project.owner[0].toUpperCase()}
                       </div>
                       <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 italic">{project.owner}</span>
                    </div>

                    <div className="col-span-3 flex justify-end gap-2">
                      <Button
                        onClick={() => navigate("/editor/" + project._id)}
                        className="h-10 px-6 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.8_0.2_210)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-2 text-white" />
                        Initialize
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl border border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                             <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-white/5 rounded-[2.5rem] p-10 max-w-md">
                          <DialogHeader className="items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center">
                               <ShieldAlert className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Terminate Access?</DialogTitle>
                              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                You are about to detach from this environment. This protocol is permanent and cannot be reversed.
                              </DialogDescription>
                            </div>
                          </DialogHeader>
                          <div className="flex gap-4 mt-8">
                             <DialogClose asChild>
                               <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                             </DialogClose>
                             <DialogClose asChild>
                               <Button
                                 onClick={async () => {
                                   try {
                                     const result = await legacyProjects.removeAccess(project._id);
                                     setSharedProjects([...result.sharedProjects].reverse());
                                   } catch (e) {
                                     if (isUnauthorizedError(e)) navigate("/auth");
                                   }
                                 }}
                                 className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20"
                               >
                                 Terminate
                               </Button>
                             </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
        
        <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
          Shared Protocol v2.4.0 · CodeHive Collaborative Systems
        </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SharedWithMe;
