import { useEffect, useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { useAuth } from "@/app/providers/AuthProvider";
import { Toaster, toast } from "sonner";
import { Key, ShieldAlert, Lock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getErrorMessage } from "@/api";

function SecurityPage() {
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Security Settings - CodeCollab";
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all security fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New credentials do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password token must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Security handshake updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Security handshake validation failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MobileSidebar />
            </div>
            <Key className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-black uppercase tracking-widest italic text-muted-foreground">Security Node</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
          <Toaster position="bottom-right" />
          <div className="max-w-2xl mx-auto space-y-12">
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-2">
                <ShieldAlert className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Gateway</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Security <span className="text-muted-foreground">Protocol</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Configure cryptographic keys and user session controls</p>
            </header>

            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="p-8 rounded-[2rem] border border-white/10 bg-neutral-900/50 backdrop-blur-md shadow-2xl space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase italic">Cryptographic Authentication</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Update account verification tokens</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Token Password</label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-neutral-950 border-white/5 h-12 rounded-xl text-sm focus:ring-white/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Token Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-neutral-950 border-white/5 h-12 rounded-xl text-sm focus:ring-white/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm New Token</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-neutral-950 border-white/5 h-12 rounded-xl text-sm focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> TLS Enforced
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-8 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-[10px] transition-all duration-200"
                  >
                    {saving ? "Updating..." : "Update Credentials"}
                  </Button>
                </div>
              </div>
            </form>

            <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
              Security Node v2.4.0 · CodeCollab System Services
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SecurityPage;
