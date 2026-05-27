import { Code } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

function HeroNavbar() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <Code className="w-4 h-4 text-primary" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-foreground">CodeHive</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors italic">Documentation</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors italic">Infrastructure</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors italic">Protocols</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="h-9 px-6 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all">
              Initialize
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default HeroNavbar;
