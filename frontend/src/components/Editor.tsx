import { Link, useNavigate, useParams } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  ChevronRight,
  CircleAlert,
  Code2,
  FileCode,
  Files,
  Plus,
  Play,
  Share2,
  Sparkles,
  Terminal,
  Trash2,
  UserPlus,
  X,
  History,
  Layout,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { legacyProjects } from "@/api";
import { createInvite } from "@/api/v1/team";
import axios from "axios";
import { isUnauthorizedError } from "@/api/client";
import { useSocketOptional } from "@/app/providers/SocketProvider";
import {
  SOCKET_EVENTS,
  accessGrantedChannel,
  accessRequestedChannel,
} from "@/realtime/events";
import {
  reverseProjectFiles,
  useEditorSocket,
} from "@/realtime/useEditorSocket";
import { YWS_URL } from "@/realtime/yjs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Alert, AlertDescription } from "./ui/alert";
import { Toaster, toast } from "sonner";

import isValidFilename from "valid-filename";
import MonacoEditor from "@monaco-editor/react";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import type { Socket } from "socket.io-client";
import type * as monaco from "monaco-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { VideoConferencePanel } from "./video/VideoConferencePanel";
import { usePresence } from "../hooks/usePresence";
import { LANGUAGE_CATALOG, type Language } from "../lib/languages";
import type { ProjectDetails, ProjectFile } from "@/types";
import { StatusBar } from "./StatusBar";
import { motion, AnimatePresence } from "framer-motion";

interface YjsInstances {
  provider: WebsocketProvider;
  ydoc: Y.Doc;
  editor: monaco.editor.IStandaloneCodeEditor;
}

const emptyProjectDetails: ProjectDetails = {
  _id: "",
  name: "",
  language: "nodejs",
  owner: "",
  collaborators: [],
  files: [],
  accessRequests: [],
  visibility: "private",
  creationTime: 0,
  editedTime: 0,
};

function getInputValue(form: HTMLFormElement, fieldName: string) {
  const field = form.elements.namedItem(fieldName);
  return field instanceof HTMLInputElement ? field.value : "";
}

function cleanError(stderr: string) {
  const firstLine = stderr
    .split("\n")
    .find((line: string) => line.includes("Error") || line.includes("Exception"));

  const codeLineMatch = stderr.match(/file0\.code:(\d+)/);
  const lineNumber = codeLineMatch ? codeLineMatch[1] : null;

  return {
    message: firstLine || "Unknown error",
    line: lineNumber,
    raw: stderr,
  };
}

function Editor() {
  const { projectId = "" } = useParams();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(emptyProjectDetails);
  const sharedSocket = useSocketOptional();
  const [isFileExist, setIsFileExist] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<unknown>(null);
  const selectedFileRef = useRef<string | null>(null);
  const yRef = useRef<{ ydoc: Y.Doc; provider: WebsocketProvider; type: Y.Text; binding: MonacoBinding | null } | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState("Run code to see output...");
  const [isError, setIsError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const navigate = useNavigate();
  const [isAccessAllowed, setIsAccessAllowed] = useState(true);
  const [requestedBy, setRequestedBy] = useState("");
  const [user, setUser] = useState("");
  const [aiExplaination, setAiExplaination] = useState("");
  const [roomState, setRoomState] = useState("Initialized");
  const [yjsInstances, setYjsInstances] = useState<YjsInstances | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const currentLanguage = projectDetails.language;
  const currentLanguageMeta = LANGUAGE_CATALOG[currentLanguage] || LANGUAGE_CATALOG.nodejs;
  const currentLanguageExtension = currentLanguageMeta.extension;
  const currentLanguageName = currentLanguageMeta.monacoLanguage;

  const { onlineUsers } = usePresence(
    yjsInstances?.provider ?? null,
    yjsInstances?.editor ?? null,
    user,
    yjsInstances?.ydoc ?? null
  );

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success("Project link copied to clipboard"))
        .catch(() => fallbackCopyToClipboard(text));
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success("Project link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy link");
    }
    document.body.removeChild(textArea);
  };

  const handleInviteTeam = async () => {
    try {
      const inviteData = await createInvite(projectId);
      if (inviteData && inviteData.inviteLink) {
        copyToClipboard(inviteData.inviteLink);
        toast.success("Invite link generated and copied to clipboard!");
      } else {
        throw new Error("Invalid invite data structure");
      }
    } catch (err) {
      console.warn("Failed to generate invite token, using direct sharing link fallback:", err);
      const directShareLink = `${window.location.origin}/editor/${projectId}`;
      copyToClipboard(directShareLink);
      toast.success("Collaboration link copied to clipboard!");
    }
  };

  useEffect(() => {
    legacyProjects
      .getProjectDetails(projectId)
      .then(async (res) => {
        const details = reverseProjectFiles(res.projectDetails);
        setProjectDetails(details);
        document.title = `${res.projectDetails.name} - CodeCollab`;
        setUser(res.user);

        // Auto-initialize with a default file if empty
        if (!details.files || details.files.length === 0) {
          const langMeta = LANGUAGE_CATALOG[res.projectDetails.language as Language] || LANGUAGE_CATALOG.nodejs;
          const defaultFileName = (res.projectDetails.language === "java" ? "Main" : "main") + langMeta.extension;
          try {
            const createRes = await legacyProjects.createFile(projectId, defaultFileName);
            const updatedDetails = reverseProjectFiles(createRes.projectDetails);
            setProjectDetails(updatedDetails);
            toast.success(`Initialized project with ${defaultFileName}`);
            if (updatedDetails.files.length > 0) {
              handleFileSelect(updatedDetails.files[0]);
            }
          } catch (err) {
            console.error("Failed to auto-initialize project file:", err);
          }
        }
      })
      .catch((error) => {
        if (!axios.isAxiosError(error)) return;
        if (isUnauthorizedError(error)) {
          navigate("/auth");
          return;
        }
        if (error.response?.status !== 403) return;
        const data = error.response?.data as {
          projectData?: ProjectDetails;
          requestedBy?: string;
        };
        if (data?.projectData) {
          setIsAccessAllowed(false);
          setProjectDetails(reverseProjectFiles(data.projectData));
          document.title = `${data.projectData.name} - CodeCollab`;
          setRequestedBy(data.requestedBy || "");
          setUser(data.requestedBy || "");
        }
      });
  }, [navigate, projectId, selectedFile]);

  const socketRef = useRef<Socket | null>(null);
  const socketConnection = sharedSocket;

  useEffect(() => {
    socketRef.current = sharedSocket ?? null;
  }, [sharedSocket]);

  const onFilesUpdated = useCallback(
    (data: { projectDetails: ProjectDetails }) => {
      setProjectDetails(reverseProjectFiles(data.projectDetails));
    },
    []
  );

  const onRoomStateChange = useCallback((state: string) => {
    setRoomState(state);
  }, []);

  useEditorSocket({
    socket: socketConnection,
    projectId,
    userId: user,
    onFilesUpdated,
    onRoomStateChange,
  });

  const accessDeniedPageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.on(accessRequestedChannel(user), (data: { projectId: string; requestedBy: string; projectName: string }) => {
      toast.custom(
        (t) => (
          <div className="bg-popover border border-white/10 p-4 rounded-xl shadow-2xl w-[320px] backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">Access Request</p>
              </div>
              <button onClick={() => toast.dismiss(t)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              <span className="font-medium text-foreground">{data.requestedBy}</span> wants to collaborate on <span className="font-medium text-foreground">"{data.projectName}"</span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="w-full h-8 text-xs font-semibold"
                onClick={() => {
                  toast.dismiss(t);
                  toast.success("Access Granted");
                  socket.emit(SOCKET_EVENTS.grantProjectAccess, {
                    projectId: data.projectId,
                    requestedBy: data.requestedBy,
                  });
                }}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => toast.dismiss(t)}
              >
                Decline
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    socket.on(accessGrantedChannel(user), () => {
      if (!accessDeniedPageRef.current) return;
      accessDeniedPageRef.current.innerHTML = `
        <div class="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Access Granted!</h2>
          <p class="text-muted-foreground">You now have permission to collaborate on this project.</p>
          <button onclick="window.location.reload()" class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">Refresh Workspace</button>
        </div>
      `;
    });
  }, [user]);

  const [isAccessRequested, setIsAccessRequested] = useState(false);

  const handleRunCode = async () => {
    const code = editorRef.current?.getValue() ?? "";
    setIsCodeRunning(true);
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.codeExecute, { roomId: projectId });
    }
    try {
      const response = await legacyProjects.runCode(code, currentLanguage);
      const result = response.result;

      if (!result) {
        setIsError(true);
        setCodeOutput(response?.msg || "Code runner is unavailable.");
      } else if (result.stderr !== "") {
        const err = cleanError(result.stderr);
        setIsError(true);
        setCodeOutput(err.raw || err.message);
      } else {
        setIsError(false);
        setCodeOutput(result.stdout?.trim() ? result.stdout : "Program finished with no output.");
      }
    } catch (error) {
      setIsError(true);
      setCodeOutput("Failed to execute code. Check connection.");
    }
    setIsCodeRunning(false);
  };

  const handleFileSelect = (file: ProjectFile) => {
    if (yRef.current) {
      yRef.current.ydoc.destroy();
      yRef.current.provider.destroy();
    }
    
    setSelectedFile(file.name);
    selectedFileRef.current = file.name;
    setEditorValue(file.content);
    if (editorRef.current) {
      editorRef.current.setValue(file.content);
    }
  };

  if (!isAccessAllowed) {
    return (
      <div className="flex bg-background min-h-screen relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(101,163,247,0.05),transparent)] pointer-events-none" />
          <header className="h-14 border-b border-white/5 flex items-center gap-4 px-8 bg-background/50 backdrop-blur-md shrink-0 w-full absolute top-0">
             <div className="md:hidden">
               <MobileSidebar />
             </div>
             <ShieldCheck className="w-4 h-4 text-destructive" />
             <h2 className="text-xs font-black uppercase tracking-widest italic">Security Clearance Required</h2>
          </header>
        <div className="flex-1 flex items-center justify-center w-full px-6" ref={accessDeniedPageRef}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
              <Layout className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Access Restricted</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You've reached the gates of <span className="text-foreground font-medium">{projectDetails.name}</span>. 
                Please request access from the project owner to start collaborating.
              </p>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground font-bold h-12 text-sm uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
              disabled={isAccessRequested || (projectDetails.accessRequests ?? []).includes(requestedBy)}
              onClick={() => {
                setIsAccessRequested(true);
                socketRef.current?.emit(SOCKET_EVENTS.requestAccess, {
                  projectId: projectId,
                  requestedBy: requestedBy,
                  projectOwner: projectDetails.owner,
                });
              }}
            >
              {isAccessRequested || projectDetails.accessRequests.includes(requestedBy)
                ? "Request Pending..."
                : "Request Access"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster theme="dark" />
      <div className="flex h-screen mesh-bg overflow-hidden font-sans selection:bg-primary/30">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-8 bg-background/60 backdrop-blur-2xl shrink-0 relative z-20">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-muted-foreground">
               <Link to="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors group">
                 <LayoutGrid className="w-4 h-4 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
               </Link>
               <ChevronRight className="w-3 h-3 text-muted-foreground/20" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{projectDetails.name}</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/25 rounded-full backdrop-blur-sm">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
               <span className="text-[9px] font-black text-primary uppercase tracking-wider">Live</span>
             </div>
          </div>
        </header>
        
        <main className="flex-1 flex overflow-hidden relative mesh-bg">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Sidebar: File Explorer */}
            <ResizablePanel defaultSize={16} minSize={12} maxSize={25} className="bg-background/40 backdrop-blur-3xl border-r border-white/10 flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Files className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Explorer</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <Dialog
                       open={isCreateDialogOpen}
                       onOpenChange={(open) => {
                         setIsCreateDialogOpen(open);
                         if (open) setIsFileExist(false);
                       }}
                     >

                        <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md hover:bg-white/5" onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="w-4 h-4" />
                        </Button>

                      <DialogContent className="bg-popover border border-white/10 rounded-2xl max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Create New File</DialogTitle>
                          <DialogDescription className="text-xs">Enter a filename for your new resource.</DialogDescription>
                        </DialogHeader>
                        <form
                          className="space-y-4 mt-2"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fileName = getInputValue(e.currentTarget, "fileName").trim();
                            if (!fileName || !isValidFilename(fileName) || fileName.includes(".")) {
                              toast.error("Invalid filename format");
                              return;
                            }
                            const fullName = fileName + currentLanguageExtension;
                            try {
                              const response = await legacyProjects.createFile(projectId, fullName);
                              setProjectDetails(reverseProjectFiles(response.projectDetails));
                              toast.success(`Created ${fullName}`);
                              handleFileSelect({ name: fullName, content: "" });
                              setIsCreateDialogOpen(false);
                            } catch (err) {
                              toast.error("Failed to create file");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <Input name="fileName" placeholder="filename" className="bg-accent/30 border-white/5 h-10 pr-12 rounded-xl" autoFocus />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-tighter">
                                {currentLanguageExtension}
                              </div>
                            </div>
                          </div>
                          <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-xl">
                            Create Resource
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 rounded-md hover:bg-white/5"
                      onClick={() => copyToClipboard(window.location.href)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {projectDetails.files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                      <Code2 className="w-12 h-12 mb-4 stroke-1" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-center px-4">No resources found</p>
                    </div>
                  ) : (
                    projectDetails.files.map((file) => (
                      <ContextMenu key={file.name}>
                        <ContextMenuTrigger>
                          <button
                            onClick={() => handleFileSelect(file)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 group relative ${
                              selectedFile === file.name
                                ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_rgba(101,163,247,0.1)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            }`}
                          >
                            <FileCode className={`w-3.5 h-3.5 ${selectedFile === file.name ? "text-primary" : "text-muted-foreground opacity-60"}`} />
                            <span className="truncate flex-1 text-left">{file.name}</span>
                            {selectedFile === file.name && (
                              <motion.div layoutId="active-file" className="absolute left-0 w-1 h-4 bg-primary rounded-r-full" />
                            )}
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="bg-popover border border-white/5 rounded-xl p-1 shadow-2xl">
                          <ContextMenuItem className="text-xs flex items-center gap-2 px-3 py-2 rounded-lg focus:bg-accent">
                            <Layout className="w-3 h-3" /> Duplicate
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={async () => {
                              try {
                                const response = await legacyProjects.deleteFile(
                                  projectDetails._id,
                                  file.name
                                );
                                setProjectDetails(reverseProjectFiles(response.projectDetails));
                                if (selectedFile === file.name) setSelectedFile(null);
                                toast.success(`Deleted ${file.name}`);
                              } catch (err) {
                                toast.error("Failed to delete resource");
                              }
                            }}
                            className="text-xs flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 focus:bg-red-400/10 focus:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Resource
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))
                  )}
                </div>

                <div className="pt-4 mt-auto border-t border-white/5 space-y-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">Collaborators</p>
                    <div className="flex -space-x-2 px-2">
                       {/* Placeholder for collaborator avatars */}
                       <div className="w-7 h-7 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[10px] font-bold">+{onlineUsers}</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-9 rounded-xl border-white/5 text-[11px] font-semibold flex items-center gap-2 bg-accent/20 hover:bg-accent/40 transition-colors" onClick={handleInviteTeam}>
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite Team
                  </Button>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-white/5 transition-colors hover:bg-primary/50" />

            {/* Main Workspace: Editor & Terminal */}
            <ResizablePanel defaultSize={64} className="flex flex-col bg-background relative">
               <AnimatePresence mode="wait">
                {selectedFile === null ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 select-none"
                  >
                    <div className="w-32 h-32 bg-accent/20 rounded-[2.5rem] flex items-center justify-center rotate-12 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                       <Code2 className="w-16 h-16 stroke-[1.5px] text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-lg font-bold tracking-tighter uppercase italic tracking-widest">Select a resource to begin</h3>
                       <p className="text-[11px] font-medium tracking-widest opacity-60 uppercase">The workspace is ready for your input</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Editor Header / Tab Bar */}
                    <div className="h-10 border-b border-white/5 bg-sidebar/20 backdrop-blur-sm flex items-center px-1">
                      <div className="flex items-center gap-0.5 overflow-x-auto h-full scrollbar-none">
                        <div className="h-8 px-4 bg-background border-x border-white/5 border-t-2 border-t-primary rounded-t-md flex items-center gap-2.5 text-[11px] font-semibold">
                          <FileCode className="w-3.5 h-3.5 text-primary" />
                          {selectedFile}
                          <button className="p-0.5 rounded-sm hover:bg-white/10 opacity-60 hover:opacity-100 transition-all">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2 pr-3">
                         <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={handleRunCode}
                                disabled={isCodeRunning}
                                className={`h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${
                                  isCodeRunning 
                                  ? "bg-muted text-muted-foreground animate-pulse" 
                                  : "bg-primary text-primary-foreground hover:scale-[1.03] active:scale-95 shadow-primary/20"
                                }`}
                              >
                                {isCodeRunning ? (
                                  <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <History className="w-3.5 h-3.5" />
                                  </motion.div>
                                ) : (
                                  <><Play className="w-3 h-3 mr-1.5 fill-current" /> Execute</>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Run current file (Ctrl + Enter)</TooltipContent>
                         </Tooltip>
                         <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-white/5">
                           <Layout className="w-3.5 h-3.5 text-muted-foreground" />
                         </Button>
                      </div>
                    </div>

                    <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={75} minSize={20}>
                        <div className="w-full h-full relative group">
                          <MonacoEditor
                            height="100%"
                            language={currentLanguageName}
                            theme="vs-dark"
                            onMount={(editor, monaco) => {
                              monacoRef.current = monaco;
                              const ydoc = new Y.Doc();
                              const provider = new WebsocketProvider(
                                YWS_URL,
                                `${projectId}:${selectedFile}`,
                                ydoc
                              );
                              
                              provider.awareness.setLocalStateField("user", {
                                name: user || "Local User",
                                color: "#65A3F7",
                              });

                              const type = ydoc.getText("monaco");
                              const model = editor.getModel();
                              new MonacoBinding(
                                type,
                                model as monaco.editor.ITextModel,
                                new Set([editor]),
                                provider.awareness
                              );

                              yRef.current = { ydoc, provider, type, binding: null };

                              editor.updateOptions({
                                mouseWheelZoom: true,
                                automaticLayout: true,
                                fontSize: 14,
                                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                                fontLigatures: true,
                                lineNumbers: "on",
                                minimap: { enabled: true, opacity: 0.5, scale: 0.75 },
                                scrollBeyondLastLine: true,
                                padding: { top: 16, bottom: 16 },
                                cursorSmoothCaretAnimation: "on",
                                cursorBlinking: "smooth",
                                smoothScrolling: true,
                                renderLineHighlight: "all",
                                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                              });
                              
                              editor.setValue(editorValue);
                              editorRef.current = editor;
                              setYjsInstances({ provider, ydoc, editor });

                              editor.onKeyUp(async () => {
                                const code = editor.getValue();
                                const fileName = selectedFileRef.current;
                                if (!fileName) return;
                                try {
                                  if (socketRef.current) {
                                    socketRef.current.emit(SOCKET_EVENTS.codeChange, {
                                      roomId: projectId,
                                      linesDelta: 1,
                                    });
                                  }
                                  await legacyProjects.saveFile(projectId, fileName, code);
                                } catch (err) {
                                  console.error("Auto-save failed");
                                }
                              });
                            }}
                          />
                          <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                               <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 italic">Live Collaborative Session</span>
                            </div>
                          </div>
                        </div>
                      </ResizablePanel>

                      <ResizableHandle className="h-[1px] bg-white/5 hover:bg-primary/30" />

                      {/* Terminal Output Panel */}
                      <ResizablePanel defaultSize={25} minSize={5} className="bg-[#0A0A0A] flex flex-col">
                        <div className="h-8 flex items-center justify-between px-4 border-b border-white/5 bg-sidebar/10">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Terminal Output</span>
                          </div>
                          <div className="flex items-center gap-2">
                             {isError && (
                               <Dialog onOpenChange={(e) => e && setAiExplaination("")}>
                                <DialogTrigger asChild>
                                  <button
                                    onClick={async () => {
                                      const wrongCode = editorRef.current?.getValue() ?? "";
                                      try {
                                        const res = await legacyProjects.aiExplain(
                                          wrongCode,
                                          currentLanguage
                                        );
                                        setAiExplaination(res.msg);
                                      } catch (e) {
                                        toast.error("AI Analysis failed");
                                      }
                                    }}
                                    className="flex items-center gap-1.5 text-[9px] font-bold text-primary hover:bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
                                  >
                                    <Sparkles size={11} />
                                    AI ANALYSIS
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="bg-popover border border-white/10 text-foreground max-w-lg max-h-[80vh] overflow-hidden flex flex-col rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 uppercase tracking-widest text-sm font-black italic">
                                      <Sparkles className="w-4 h-4 text-primary" />
                                      AI Error Intelligence
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar py-4 text-xs leading-relaxed">
                                    {aiExplaination === "" ? (
                                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="font-bold tracking-widest opacity-50 uppercase text-[10px]">Processing Contextual Intelligence...</p>
                                      </div>
                                    ) : (
                                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-xs max-w-none prose-p:mb-2 prose-code:text-primary">
                                        {aiExplaination}
                                      </ReactMarkdown>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                             )}
                            <button onClick={() => setCodeOutput("Run code to see output...")} className="text-muted-foreground hover:text-foreground">
                               <X size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto selection:bg-primary/20 custom-scrollbar">
                           <pre className={`${isError ? "text-red-400" : "text-emerald-400/90"} leading-relaxed whitespace-pre-wrap`}>
                             {codeOutput}
                           </pre>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </motion.div>
                )}
               </AnimatePresence>
               <StatusBar language={currentLanguageName} roomState={roomState} onlineCount={onlineUsers} />
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-white/5 hover:bg-primary/30" />

            {/* Sidebar Right: Collaboration Panel */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar/20 backdrop-blur-sm flex flex-col">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Conference</span>
                   </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {socketConnection && user ? (
                    <VideoConferencePanel
                      roomId={projectId}
                      socket={socketConnection}
                      userId={user}
                      userName={user}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center px-8 opacity-20">
                      <div className="space-y-4">
                        <Layout className="w-12 h-12 mx-auto stroke-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Establishing connection to signaling backbone...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}

export default Editor;
