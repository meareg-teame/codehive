import { useEffect, useState } from "react";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Toaster, toast } from "sonner";
import { Settings, Cpu, SwitchCamera, Check } from "lucide-react";
import { Button } from "./ui/button";

function PreferencesPage() {
  const [telemetry, setTelemetry] = useState(true);
  const [interfaceMode, setInterfaceMode] = useState("Dark Protocol");
  const [editorWrap, setEditorWrap] = useState(true);

  useEffect(() => {
    document.title = "Preferences - CodeCollab";
  }, []);

  const handleSave = () => {
    toast.success("System configurations persisted");
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
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-black uppercase tracking-widest italic text-muted-foreground">Config Node</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
          <Toaster position="bottom-right" />
          <div className="max-w-2xl mx-auto space-y-12">
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-2">
                <SwitchCamera className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telemetry Node</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">System <span className="text-muted-foreground">Config</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Adjust node telemetry, dynamic compiler wrap and console parameters</p>
            </header>

            <div className="space-y-8">
              <div className="p-8 rounded-[2rem] border border-white/10 bg-neutral-900/50 backdrop-blur-md shadow-2xl space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase italic">Preferences & Parameters</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Adjust workspace behaviors</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">Performance Telemetry</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Send diagnostic sync to development clusters</p>
                    </div>
                    <button
                      onClick={() => setTelemetry(!telemetry)}
                      className={`h-7 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        telemetry
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-muted-foreground border-white/10"
                      }`}
                    >
                      {telemetry ? "Online" : "Offline"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">Dynamic Theme mode</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Interface rendering mode</p>
                    </div>
                    <span className="text-[10px] font-black uppercase italic text-muted-foreground/60">
                      {interfaceMode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">Editor Line Wrap</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Wrap overflow code lines in editor panel</p>
                    </div>
                    <button
                      onClick={() => setEditorWrap(!editorWrap)}
                      className={`h-7 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        editorWrap
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-muted-foreground border-white/10"
                      }`}
                    >
                      {editorWrap ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Config node ready
                  </div>
                  <Button
                    onClick={handleSave}
                    className="h-10 px-8 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-[10px] transition-all duration-200"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

            <footer className="py-12 opacity-15 text-[10px] font-bold uppercase tracking-[0.4em] text-center text-muted-foreground">
              Config Node v2.4.0 · CodeCollab System Services
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PreferencesPage;
