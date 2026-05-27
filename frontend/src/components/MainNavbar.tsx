import { Menu, Command, ChevronRight, LogOut, Key, Settings, User } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/app/providers/AuthProvider";
import { getErrorMessage } from "@/api";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
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

function MainNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, changePassword } = useAuth();
  const userData = user ?? {
    name: "Local User",
    email: "local@codehive.dev",
    photoUrl: "",
  };

  const displayName = userData?.name?.trim() || "Local User";
  const displayEmail = userData?.email?.trim() || "local@codehive.dev";
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const displayInitials =
    nameParts.length === 1
      ? `${nameParts[0][0] || "L"}${nameParts[0][1] || nameParts[0][0] || "U"}`
      : `${nameParts[0]?.[0] || "L"}${nameParts[nameParts.length - 1]?.[0] || "U"}`;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Access Management", path: "/access-management" },
    { name: "Shared with Me", path: "/shared-with-me" },
  ];

  const currentPathName = navLinks.find(link => link.path === location.pathname)?.name || "";

  return (
    <nav className="h-12 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--popover)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          },
        }}
      />

      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Command className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:block">CodeHive</span>
        </Link>

        {currentPathName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{currentPathName}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                location.pathname === link.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-background border-r border-white/5 w-[240px]"
            >
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm font-medium hover:text-primary transition-colors px-2 py-1"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
              <Avatar className="h-full w-full">
                <AvatarImage src={userData.photoUrl} />
                <AvatarFallback className="text-[10px] bg-accent">{displayInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 bg-popover border border-white/5 shadow-2xl rounded-xl p-1"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
            </div>
            
            <DropdownMenuSeparator className="bg-white/5" />
            
            <DropdownMenuItem className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg focus:bg-accent">
              <User className="w-3.5 h-3.5" />
              Profile Settings
            </DropdownMenuItem>

            <Dialog>
              <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-xs outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                  <Key className="w-3.5 h-3.5" />
                  Change Password
                </div>
              </DialogTrigger>
              <DialogContent className="bg-popover border border-white/5 text-foreground max-w-sm rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Update Password</DialogTitle>
                  <DialogDescription className="text-xs">
                    Secure your account with a new password.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      await changePassword(
                        String(formData.get("oldPassword") || ""),
                        String(formData.get("newPassword") || "")
                      );
                      toast.success("Password updated successfully");
                    } catch (err) {
                      toast.error(getErrorMessage(err, "Failed to update password"));
                    }
                  }}
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase" htmlFor="oldPassword">Current Password</label>
                    <Input id="oldPassword" name="oldPassword" type="password" className="bg-accent/30 border-white/5 h-9 text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase" htmlFor="newPassword">New Password</label>
                    <Input id="newPassword" name="newPassword" type="password" className="bg-accent/30 border-white/5 h-9 text-sm" required />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold h-9 rounded-lg">
                    Update Password
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <DropdownMenuItem className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg focus:bg-accent">
              <Settings className="w-3.5 h-3.5" />
              Preferences
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5" />

            <DropdownMenuItem
              className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg text-red-400 focus:bg-red-400/10 focus:text-red-400"
              onClick={async () => {
                try {
                  await logout();
                  navigate("/");
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

export default MainNavbar;
