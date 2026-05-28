import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  Link2,
  AlertCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  Users,
  Code2,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import HeroNavbar from "@/components/HeroNavbar";
import { decodeInviteToken } from "@/lib/jwt";
import { useAuth } from "@/app/providers/AuthProvider";
import { legacyProjects } from "@/api";
import { getJoinInfo, type JoinInfo } from "@/api/v1/team";
import { motion } from "framer-motion";

function JoinPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const payload = decodeInviteToken(token);

  useEffect(() => {
    document.title = "Join Project — CodeCollab";
  }, []);

  // Fetch project info from the token without requiring auth
  useEffect(() => {
    if (!token) return;
    setInfoLoading(true);
    getJoinInfo(token)
      .then((info) => {
        setJoinInfo(info);
        setInfoError(null);
      })
      .catch(() => {
        setInfoError("This invite link is invalid or has expired.");
      })
      .finally(() => setInfoLoading(false));
  }, [token]);

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    setJoinError(null);
    try {
      await legacyProjects.joinProject(token);
      setJoined(true);
      setTimeout(() => {
        navigate(`/editor/${joinInfo?.projectId || payload?.projectId}`);
      }, 1200);
    } catch {
      setJoinError("Could not join the project. The invite may have expired.");
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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-5 pointer-events-none" />
      <HeroNavbar />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="rounded-[2rem] border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header stripe */}
            <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                <Link2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Team Invitation
                </span>
              </div>

              {infoLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner className="w-6 h-6 text-muted-foreground" />
                </div>
              ) : infoError ? (
                <div className="space-y-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                    Invalid Link
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {infoError} Ask the project owner to send you a fresh invite.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-white/80" />
                  </div>
                  <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                    Join Workspace
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {joinInfo?.inviterName
                      ? `${joinInfo.inviterName} invited you to collaborate`
                      : "You've been invited to collaborate"}
                  </p>
                </div>
              )}
            </div>

            {/* Project meta */}
            {!infoLoading && !infoError && joinInfo && (
              <div className="px-8 py-6 border-b border-white/5">
                <div className="rounded-xl bg-neutral-950 border border-white/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Project
                      </p>
                      <p className="font-black text-sm uppercase italic truncate">
                        {joinInfo.projectName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {joinInfo.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {joinInfo.visibility === "public" ? (
                        <Globe className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider capitalize">
                        {joinInfo.visibility}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action area */}
            <div className="px-8 py-8 space-y-4">
              {!infoLoading && infoError ? (
                /* Invalid link: just go home */
                <Button asChild className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-xs">
                  <Link to="/">Go to homepage</Link>
                </Button>
              ) : loading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="w-5 h-5 text-muted-foreground" />
                </div>
              ) : !user ? (
                /* NOT LOGGED IN */
                <div className="space-y-3">
                  <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Create an account or sign in to join
                  </p>

                  <Button asChild className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95">
                    <Link to={`/auth`} state={{ from: `/join/${token}`, joinAfter: true }}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account & Join
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" className="w-full h-11 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-all">
                    <Link to={`/auth`} state={{ from: `/join/${token}`, tab: "login" }}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In Instead
                    </Link>
                  </Button>

                  <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest pt-2">
                    You'll be redirected back here after login
                  </p>
                </div>
              ) : joined ? (
                /* Joined successfully */
                <div className="text-center space-y-3 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="font-black text-sm uppercase italic text-emerald-400">
                    Access Granted!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to editor…
                  </p>
                </div>
              ) : (
                /* LOGGED IN: show join button */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-black italic">
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase italic truncate">
                        {user.name || "You"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {joinError && (
                    <p className="text-xs text-red-400 text-center font-medium">
                      {joinError}
                    </p>
                  )}

                  <Button
                    onClick={() => void handleJoin()}
                    disabled={joining}
                    className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {joining ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {joining ? "Joining…" : "Accept & Open Editor"}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                CodeCollab · Secure Collaboration Platform
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default JoinPage;
