import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Link2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import HeroNavbar from "@/components/HeroNavbar";
import { decodeInviteToken } from "@/lib/jwt";
import { useAuth } from "@/app/providers/AuthProvider";
import { motion } from "framer-motion";

function JoinPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading, guestLogin } = useAuth();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = decodeInviteToken(token);

  useEffect(() => {
    document.title = "Join Project - CodeHive";
  }, []);

  const openProject = () => {
    if (!payload?.projectId) return;
    navigate(`/editor/${payload.projectId}`);
  };

  const handleContinue = async () => {
    if (!payload?.projectId) {
      setError("This invite link is invalid or has expired.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      if (!user) {
        await guestLogin();
      }
      openProject();
    } catch {
      setError("Could not start a session. Try signing in from the auth page.");
    } finally {
      setJoining(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Missing invite token.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-10 pointer-events-none" />
      <HeroNavbar />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-[2.5rem] bg-sidebar/20 border border-white/5 backdrop-blur-xl shadow-2xl space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mx-auto">
            <Link2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Team Invite
            </span>
          </div>

          {!payload ? (
            <div className="space-y-4">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <h1 className="text-xl font-black uppercase italic">Invalid invite</h1>
              <p className="text-xs text-muted-foreground">
                The link may be expired or malformed. Ask the project owner for a new
                invite.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">Go to sign in</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
              <h1 className="text-xl font-black uppercase italic">Join workspace</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You were invited to collaborate on project{" "}
                <span className="text-foreground font-mono text-[10px]">
                  {payload.projectId}
                </span>
                . Continue to open the editor; request access if you are not yet a
                collaborator.
              </p>

              {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
              )}

              <Button
                className="w-full h-12 font-black uppercase tracking-widest text-xs"
                disabled={loading || joining}
                onClick={() => void handleContinue()}
              >
                {loading || joining ? (
                  <Spinner className="w-4 h-4" />
                ) : user ? (
                  "Open project"
                ) : (
                  "Continue as guest"
                )}
              </Button>

              {!user && (
                <Button asChild variant="ghost" className="w-full text-xs">
                  <Link to="/auth" state={{ from: `/join/${token}` }}>
                    Sign in instead
                  </Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default JoinPage;
