import HeroNavbar from "./HeroNavbar.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getErrorMessage } from "@/api";

function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, guestLogin } = useAuth();

  const redirectTo = (location.state as { from?: string } | null)?.from || "/dashboard";

  const handleGuest = async () => {
    setIsLoading(true);
    try {
      await guestLogin();
      navigate(redirectTo);
    } catch {
      toast.error("Handshake failed. Protocol unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Authenticated");
      navigate(redirectTo);
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    setIsLoading(true);
    try {
      const msg = await signup(name, email, password);
      if (msg === "success") {
        toast.success("Identity initialized! Synchronizing session...");
        await login(email, password);
        navigate(redirectTo);
      } else if (msg === "failure") {
        toast.error("Please wait before requesting another verification email");
      } else {
        toast.info(msg);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Signup failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-5 pointer-events-none" />
      
      <HeroNavbar />
      <Toaster position="bottom-right" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Gateway</span>
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Initialize <span className="text-primary">Session</span></h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Authentication protocol required</p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card/40 border border-border backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-2 bg-background/30 p-1.5 rounded-2xl mb-8 border border-border h-12">
                <TabsTrigger value="account" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all italic">Login</TabsTrigger>
                <TabsTrigger value="password" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all italic">Provision</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Terminal ID</label>
                    <Input name="email" placeholder="name@domain.com" type="email" required className="h-12 bg-background/40 border-border rounded-xl px-4 text-sm focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Token</label>
                    <Input name="password" placeholder="••••••••" type="password" required className="h-12 bg-background/40 border-border rounded-xl px-4 text-sm focus:ring-primary/20" />
                  </div>
                  <Button disabled={isLoading} type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                    {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-white" />}
                    {isLoading ? "Synchronizing..." : "Authenticate"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="password" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Name</label>
                    <Input name="name" placeholder="Developer ID" type="text" required className="h-12 bg-background/40 border-border rounded-xl px-4 text-sm focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Terminal ID</label>
                    <Input name="email" placeholder="name@domain.com" type="email" required className="h-12 bg-background/40 border-border rounded-xl px-4 text-sm focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Token</label>
                    <Input name="password" placeholder="••••••••" type="password" required minLength={6} className="h-12 bg-background/40 border-border rounded-xl px-4 text-sm focus:ring-primary/20" />
                  </div>
                  <Button disabled={isLoading} type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                    {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-white" />}
                    {isLoading ? "Initializing..." : "Initialize Identity"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => void handleGuest()}
                className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Continue as guest (demo)
              </Button>
            </div>
          </div>
          
          <p className="text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">
            Authorized Access Only
          </p>
        </motion.div>
      </main>

      <footer className="py-8 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
        CodeHive · Secure Collaboration Platform
      </footer>
    </div>
  );
}

export default Auth;
