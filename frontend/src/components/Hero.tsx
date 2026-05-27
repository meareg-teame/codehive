import HeroNavbar from "./HeroNavbar.tsx";
import { Badge } from "@/components/ui/badge";
import {
  CloudUpload,
  Code,
  Radio,
  UsersRound,
  Zap,
  Cpu,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { legacyAuth } from "@/api";

function Hero() {
  const navigate = useNavigate();

  useEffect(() => {
    legacyAuth
      .checkSession()
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -mt-48" />
      
      <HeroNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-10 max-w-4xl"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {["Teams", "Classrooms", "Hackathons"].map((text, i) => (
              <Badge key={i} variant="outline" className="bg-white/5 border-white/10 px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground shadow-xl">
                {text}
              </Badge>
            ))}
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
              Stop <span className="text-muted-foreground/30">Streaming</span>. <br />
              Start <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Merging</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              The high-fidelity collaborative engine for the next generation of developers. 
              Real-time sync, shared runtimes, and neural-fast feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/auth">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/30 group">
                <Code className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Initialize Environment
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-16 px-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all">
              Explore Protocol
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full"
        >
          {[
            { 
              icon: Radio, 
              title: "Neural Sync", 
              desc: "Sub-millisecond state replication across global clusters.",
              color: "text-emerald-400"
            },
            { 
              icon: UsersRound, 
              title: "Shared Context", 
              desc: "Universal cursors and environment state shared instantly.",
              color: "text-primary"
            },
            { 
              icon: CloudUpload, 
              title: "Atomic Saves", 
              desc: "Persistent cloud snapshots with zero-latency recovery.",
              color: "text-amber-400"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group p-8 rounded-[2.5rem] bg-sidebar/20 border border-white/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-6">
                <div className={`w-14 h-14 rounded-2xl bg-background border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed uppercase tracking-wider text-[10px]">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom Decorative Section */}
        <div className="mt-40 w-full max-w-4xl opacity-20">
           <div className="flex items-center justify-between gap-12 flex-wrap justify-center">
              {[Zap, Cpu, Layers, Code, Radio].map((Icon, i) => (
                <Icon key={i} className="w-8 h-8 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
              ))}
           </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 flex flex-col items-center gap-6 opacity-40">
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] italic">
           <span>Infrastructure</span>
           <span>Protocols</span>
           <span>Privacy</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest tracking-[0.2em]">© 2026 CodeHive Collaborative Systems</p>
      </footer>
    </div>
  );
}

// Internal Button component for clean code if not imported
function Button({ className, children, variant = "default", size = "default", ...props }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-white/10 bg-transparent hover:bg-white/5",
    ghost: "bg-transparent hover:bg-white/5",
  };
  const sizes: any = {
    default: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
  };
  return (
    <button 
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

export default Hero;
