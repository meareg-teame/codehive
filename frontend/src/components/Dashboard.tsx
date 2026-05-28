import { useEffect, useState, type FormEvent } from "react";
import { legacyProjects } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Bot, CircleAlert, Cloud, Plus, Radio, Search, LayoutGrid, List, MoreVertical, ExternalLink, Trash2, Calendar, Clock, Lock, Globe, Users, Menu, Code } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { format } from "timeago.js";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LANGUAGE_CATALOG,
  PROJECT_LANGUAGE_OPTIONS,
  type Language,
} from "../lib/languages";
import { motion, AnimatePresence } from "framer-motion";

type UserData = {
  name: string;
  email: string;
  photoUrl: string;
};

type ProjectSummary = {
  _id: string;
  name: string;
  language: Language;
  visibility?: string;
  owner?: string;
  collaborators?: string[];
  files?: Array<{ name: string; content: string }>;
  accessRequests?: string[];
  creationTime?: number;
  editedTime?: number;
};

function Dashboard() {
  const navigate = useNavigate();
  const { user: userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectNameAvailable, setIsProjectNameAvailable] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [projectLanguage, setProjectLanguage] = useState<Language | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getProjectTimeLabel = (project: ProjectSummary) => {
    const editedTime = Number(project.editedTime || 0);
    const creationTime = Number(project.creationTime || 0);
    const timestamp = editedTime || creationTime;

    if (!Number.isFinite(timestamp) || timestamp <= 0) return "Recently created";
    return editedTime === 0 ? `Created ${format(timestamp)}` : `Modified ${format(timestamp)}`;
  };

  const fetchProjects = async () => {
    try {
      const projects = await legacyProjects.getProjects();
      setUserProjects([...projects].reverse());
    } catch (error) {
      if (isUnauthorizedError(error)) navigate("/auth");
      console.log(error);
    }
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectName.trim() || !projectLanguage || !isProjectNameAvailable) return;

    setIsLoading(true);
    try {
      await legacyProjects.createProject({
        projectName: projectName.trim(),
        language: projectLanguage,
        visibility: "private",
      });
      toast.success("New project initialized");
      setProjectName("");
      setProjectLanguage("");
      setIsDialogOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error("Failed to create project");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkProjectName = (name: string) => {
    if (!name.trim()) {
      setIsProjectNameAvailable(true);
      return;
    }
    const exists = userProjects.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    setIsProjectNameAvailable(!exists);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = userProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="flex h-screen mesh-bg text-foreground">
      <Toaster theme="dark" />
      <Sidebar user={userData as UserData} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between p-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <MobileSidebar user={userData as UserData} />
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="w-5 h-5" />
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new project</DialogTitle>
                  <DialogDescription>
                    Enter a name and select a language for your new project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        checkProjectName(e.target.value);
                      }}
                      placeholder="my-awesome-project"
                      className={!isProjectNameAvailable ? "border-destructive" : ""}
                    />
                    {!isProjectNameAvailable && (
                      <p className="text-sm text-destructive mt-1">
                        A project with this name already exists.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="projectLanguage">Language</Label>
                    <select
                      id="projectLanguage"
                      value={projectLanguage}
                      onChange={(e) => setProjectLanguage(e.target.value as Language)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select a language</option>
                      {PROJECT_LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isLoading || !projectName || !projectLanguage || !isProjectNameAvailable}
                    >
                      {isLoading && <Spinner className="mr-2" />}
                      Create Project
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {filteredProjects.length > 0 ? (
              <motion.div
                key="projects-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
                }
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    onClick={() => navigate(`/editor/${project._id}`)}
                  >
                    {viewMode === 'grid' ? (
                      <ProjectCard project={project} getProjectTimeLabel={getProjectTimeLabel} />
                    ) : (
                      <ProjectListItem project={project} getProjectTimeLabel={getProjectTimeLabel} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto"
              >
                <div className="w-24 h-24 mb-6 rounded-2xl glass flex items-center justify-center text-primary relative overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors duration-500" />
                   <Code className="w-10 h-10 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Your workspace awaits</h2>
                <p className="mt-3 text-muted-foreground/80 leading-relaxed">
                  You haven't created any projects yet. Click the "New Project" button above to spin up a high-performance collaboration environment.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const ProjectCard = ({ project, getProjectTimeLabel }: { project: ProjectSummary, getProjectTimeLabel: (p: ProjectSummary) => string }) => {
  const languageInfo = LANGUAGE_CATALOG[project.language];
  const label = languageInfo?.label || project.language;
  return (
    <div className="glass group rounded-xl cursor-pointer flex flex-col h-full relative overflow-hidden transition-all duration-300">
      {/* Subtle animated gradient glow behind the card on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-5 flex-grow relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg tracking-tight truncate">{project.name}</h3>
          </div>
          <Badge variant={project.visibility === 'public' ? 'secondary' : 'outline'} className="bg-background/50 backdrop-blur-sm border-white/10">
            {project.visibility === 'public' ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
            {project.visibility || "private"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground/80 line-clamp-2">
          A collaborative workspace environment for {label}.
        </p>
      </div>
      <div className="border-t border-white/5 p-4 bg-background/20 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{getProjectTimeLabel(project)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>{project.collaborators?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectListItem = ({ project, getProjectTimeLabel }: { project: ProjectSummary, getProjectTimeLabel: (p: ProjectSummary) => string }) => {
  const languageInfo = LANGUAGE_CATALOG[project.language];
  const label = languageInfo?.label || project.language;
  return (
    <div className="glass group rounded-xl cursor-pointer flex items-center p-5 relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center gap-4 flex-grow relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          <Code className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg tracking-tight">{project.name}</h3>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70">{label} • {getProjectTimeLabel(project)}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground relative z-10">
        <Badge variant={project.visibility === 'public' ? 'secondary' : 'outline'} className="hidden sm:flex bg-background/50 backdrop-blur-sm border-white/10">
          {project.visibility === 'public' ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
          {project.visibility || "private"}
        </Badge>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span>{project.collaborators?.length || 0}</span>
        </div>
      </div>
      <div className="ml-6 relative z-10">
        <MoreVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
};

export default Dashboard;
