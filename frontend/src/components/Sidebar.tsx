import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Share2,
  LogOut,
  Menu,
  User,
  Key,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import type { AuthUser } from "@/types";

type SidebarProps = {
  user?: AuthUser | null;
};

const workspaceItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shared-with-me", label: "Shared With Me", icon: Share2 },
  { to: "/access-management", label: "Access Management", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const accountItems = [
  { to: "/profile", label: "Profile Settings", icon: User },
  { to: "/security", label: "Security Keys", icon: Key },
  { to: "/preferences", label: "System Config", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Workspace</p>
        <nav className="grid gap-1">
          {workspaceItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                  "text-muted-foreground hover:bg-neutral-900/50 hover:text-foreground",
                  isActive && "bg-neutral-800 text-foreground border border-white/5"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Account Settings</p>
        <nav className="grid gap-1">
          {accountItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                  "text-muted-foreground hover:bg-neutral-900/50 hover:text-foreground",
                  isActive && "bg-neutral-800 text-foreground border border-white/5"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function UserBlock({ user }: { user: AuthUser | null }) {
  const initials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/40 border border-white/5">
      <Avatar className="h-9 w-9 border border-white/10">
        <AvatarImage src={user?.photoUrl || ""} alt={user?.name || "User"} />
        <AvatarFallback className="bg-neutral-800 text-xs font-bold italic">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black uppercase italic">{user?.name || "Guest User"}</p>
        <p className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">{user?.email || "local@codecollab.dev"}</p>
      </div>
    </div>
  );
}

export function Sidebar({ user: userProp }: SidebarProps) {
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();
  const user = userProp ?? ctxUser;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-950">
      <div className="p-6">
        <div
          className="cursor-pointer space-y-1"
          onClick={() => navigate("/dashboard")}
        >
          <p className="text-sm font-black uppercase italic tracking-tighter">CodeCollab</p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.25em]">Secure Dev Space</p>
        </div>
      </div>

      <div className="px-4">
        <Separator className="bg-white/5" />
      </div>

      <div className="flex-1 p-4">
        <SidebarNav />
      </div>

      <div className="p-4 pt-0 space-y-3">
        <Separator className="bg-white/5" />
        <UserBlock user={user} />
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Terminate Session
        </Button>
      </div>
    </aside>
  );
}

export function MobileSidebar({ user: userProp }: SidebarProps) {
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();
  const user = userProp ?? ctxUser;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="border border-white/5 bg-neutral-950">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 border-r border-white/10 bg-neutral-950 p-6 flex flex-col h-full text-foreground">
        <SheetHeader className="text-left pb-4 border-b border-white/5">
          <SheetTitle className="text-sm font-black uppercase italic tracking-tighter">CodeCollab</SheetTitle>
        </SheetHeader>

        <div className="flex-1 py-6 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
          <UserBlock user={user} />
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Terminate Session
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
