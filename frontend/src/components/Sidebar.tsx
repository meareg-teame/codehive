import { Menu, Command, ChevronRight, LogOut, Key, Settings, User, LayoutGrid, Share2, ShieldCheck, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { getErrorMessage } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, changePassword } = useAuth();

  const userData = user ?? {
    name: "Local User",
    email: "local@codehive.dev",
    photoUrl: "",
  };

  const displayName = userData.name?.trim() || "Local User";
  const displayEmail = userData.email?.trim() || "local@codehive.dev";
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const displayInitials =
    nameParts.length === 1
      ? `${nameParts[0][0] || "L"}${nameParts[0][1] || nameParts[0][0] || "U"}`
      : `${nameParts[0]?.[0] || "L"}${nameParts[nameParts.length - 1]?.[0] || "U"}`;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { name: "Analytics", path: "/analytics", icon: Activity },
    { name: "Shared Projects", path: "/shared-with-me", icon: Share2 },
    { name: "Access Control", path: "/access-management", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-sidebar/40 backdrop-blur-3xl flex flex-col sticky top-0 z-50 shrink-0">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Command className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tighter uppercase italic">CodeHive</span>
            <span className="text-[8px] font-bold text-primary tracking-[0.3em] uppercase">Enterprise</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-3">Protocol Navigation</span>
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
              <span className="text-xs font-bold uppercase tracking-widest italic">{link.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1 h-4 bg-primary-foreground rounded-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-16 flex items-center gap-3 px-3 rounded-2xl border border-white/0 hover:border-white/5 hover:bg-white/5 transition-all">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={userData.photoUrl} />
                <AvatarFallback className="text-xs font-bold bg-accent">{displayInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate">
                <span className="text-xs font-black uppercase italic truncate w-full text-left">{displayName}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate w-full text-left">{displayEmail}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side="right"
            sideOffset={12}
            className="w-64 bg-popover/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-2 ml-2"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Identity Profile</span>
            </DropdownMenuLabel>
            
            <DropdownMenuItem className="flex items-center gap-2 text-xs py-2.5 px-3 rounded-xl focus:bg-primary focus:text-primary-foreground group">
              <User className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider italic">Profile Protocol</span>
            </DropdownMenuItem>

            <Dialog>
              <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2.5 text-xs outline-none transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Key className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider italic">Security Keys</span>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-popover border border-white/5 text-foreground max-w-sm rounded-[2rem] shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Handshake Protocol</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Update your access credentials
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-6 mt-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      await changePassword(
                        String(formData.get("oldPassword") || ""),
                        String(formData.get("newPassword") || "")
                      );
                      toast.success("Security Handshake Successful");
                    } catch (err) {
                      toast.error(getErrorMessage(err, "Protocol Failure"));
                    }
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Token</label>
                    <Input name="oldPassword" type="password" className="bg-white/5 border-white/5 h-12 rounded-xl text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Provision</label>
                    <Input name="newPassword" type="password" className="bg-white/5 border-white/5 h-12 rounded-xl text-sm" required />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground font-black h-12 rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">
                    Confirm Provisioning
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <DropdownMenuItem className="flex items-center gap-2 text-xs py-2.5 px-3 rounded-xl focus:bg-primary focus:text-primary-foreground">
              <Settings className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider italic">Preferences</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5 my-2" />

            <DropdownMenuItem
              className="flex items-center gap-2 text-xs py-2.5 px-3 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={async () => {
                try {
                  await logout();
                  navigate("/");
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider italic">Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-background border-r border-white/5">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
