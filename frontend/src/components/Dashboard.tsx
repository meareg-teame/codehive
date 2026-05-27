import { useEffect, useState, type FormEvent } from "react";
import { legacyProjects } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Bot, CircleAlert, Cloud, Plus, Radio, Search, LayoutGrid, List, MoreVertical, ExternalLink, Trash2, Calendar, Clock, Lock, Globe, Users, Menu } from "lucide-react";
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
      fetchProjects();
    } catch (error) {
      toast.error("Failed to create project");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkProjectName = async (name: string) => {
    if (!name.trim()) {
      setIsProjectNameAvailable(true);
      return;
    }
    try {
      const response = await legacyProjects.checkProjectName(name);
      setIsProjectNameAvailable(response.isAvailable);
    } catch (error) {
      console.log(error);
    }
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
    <div className="flex h-screen bg-background text-foreground">
      <Toaster theme="dark" />
      <Sidebar user={userData as UserData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <MobileSidebar user={userData as UserData} />
            <h1 className="text-2xl font-semibold">Dashboard</h1>
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
            <Dialog>
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
                    <Select
                      value={projectLanguage}
                      onValueChange={(value) => setProjectLanguage(value as Language)}
                    >
                      <SelectTrigger id="projectLanguage">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PROJECT_LANGUAGE_OPTIONS.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <Bot className="w-24 h-24 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-semibold">No projects found</h2>
                <p className="mt-2 text-muted-foreground">
                  Get started by creating a new project.
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
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
      <div className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={languageInfo.icon} alt={languageInfo.name} className="w-6 h-6" />
            <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          </div>
          <Badge variant={project.visibility === 'public' ? 'secondary' : 'outline'}>
            {project.visibility === 'public' ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
            {project.visibility}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          A collaborative project for {languageInfo.name}.
        </p>
      </div>
      <div className="border-t border-border p-4 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{getProjectTimeLabel(project)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          <span>{project.collaborators?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectListItem = ({ project, getProjectTimeLabel }: { project: ProjectSummary, getProjectTimeLabel: (p: ProjectSummary) => string }) => {
  const languageInfo = LANGUAGE_CATALOG[project.language];
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center p-4">
      <div className="flex items-center gap-4 flex-grow">
        <img src={languageInfo.icon} alt={languageInfo.name} className="w-8 h-8" />
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <p className="text-sm text-muted-foreground">{getProjectTimeLabel(project)}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <Badge variant={project.visibility === 'public' ? 'secondary' : 'outline'} className="hidden sm:flex">
          {project.visibility === 'public' ? <Globe className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
          {project.visibility}
        </Badge>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{project.collaborators?.length || 0}</span>
        </div>
      </div>
      <div className="ml-6">
        <MoreVertical className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
};

export default Dashboard;
