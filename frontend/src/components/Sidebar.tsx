import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Share2,
  LogOut,
  Menu,
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

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shared-with-me", label: "Shared With Me", icon: Share2 },
  { to: "/access-management", label: "Access Management", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
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
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user?.photoUrl || ""} alt={user?.name || "User"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user?.name || ""}</p>
        <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
      </div>
    </div>
  );
}

export function Sidebar({ user: userProp }: SidebarProps) {
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();
  const user = userProp ?? ctxUser;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/30 backdrop-blur">
      <div className="p-4">
        <div
          className="cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <p className="text-sm font-semibold tracking-tight">CodeHive</p>
          <p className="text-xs text-muted-foreground">Collaborate. Execute. Ship.</p>
        </div>
      </div>

      <div className="px-4">
        <Separator />
      </div>

      <div className="flex-1 p-4">
        <SidebarNav />
      </div>

      <div className="p-4 pt-0">
        <Separator className="mb-4" />
        <UserBlock user={user} />
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
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
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 border-border">
        <SheetHeader>
          <SheetTitle>CodeHive</SheetTitle>
        </SheetHeader>

        <div className="px-4">
          <Separator className="mb-4" />
          <SidebarNav onNavigate={() => {}} />
        </div>

        <div className="mt-auto p-4">
          <Separator className="mb-4" />
          <UserBlock user={user} />
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
