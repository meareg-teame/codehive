import { useEffect, useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { Toaster, toast } from "sonner";
import { User, Shield, Camera, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Identity Profile - CodeCollab";
    if (user) {
      setName(user.name || "");
      setPhotoUrl(user.photoUrl || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Profile name is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(name, photoUrl);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile info");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MobileSidebar />
            </div>
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-black uppercase tracking-widest italic text-muted-foreground">Identity Protocol</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
          <Toaster position="bottom-right" />
          <div className="max-w-2xl mx-auto space-y-12">
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-2">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Node</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Profile <span className="text-muted-foreground">Identity</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Manage your collaborative credentials and clearance identifiers</p>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="p-8 rounded-[2rem] border border-white/10 bg-neutral-900/50 backdrop-blur-md shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-neutral-800 border border-white/10 flex items-center justify-center text-2xl font-black italic overflow-hidden shadow-inner">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="font-black text-lg uppercase italic">{user?.name || "Guest User"}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{user?.email || "local@codecollab.dev"}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                        <Check className="w-2.5 h-2.5" /> Verified Developer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Profile Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter identity name"
                      className="bg-neutral-950 border-white/5 h-12 rounded-xl text-sm focus:ring-white/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Avatar Image URL</label>
                    <Input
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-neutral-950 border-white/5 h-12 rounded-xl text-sm focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    ID: {user?._id || "local-developer"}
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-8 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-[10px] transition-all duration-200"
                  >
                    {saving ? "Saving..." : "Save Identity"}
                  </Button>
                </div>
              </div>
            </form>

            <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
              Identity Node v2.4.0 · CodeCollab System Services
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
