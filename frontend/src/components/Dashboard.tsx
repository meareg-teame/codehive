import { useEffect, useState, useMemo } from "react";
import { legacyProjects } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { type Language } from "@/lib/languages";
import { ProjectCard } from "./dashboard/ProjectCard";
import { Toolbar } from "./dashboard/Toolbar";
import { CreateProjectDialog } from "./dashboard/CreateProjectDialog";
import { format } from "timeago.js";

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
  const [projectName, setProjectName] = useState("");
  const [projectLanguage, setProjectLanguage] = useState<Language | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isProjectNameAvailable = useMemo(() => {
    if (!projectName.trim()) return true;
    return !userProjects.some(
      (p) => p.name.toLowerCase() === projectName.trim().toLowerCase()
    );
  }, [projectName, userProjects]);

  const getProjectTimeLabel = (project: ProjectSummary) => {
    const editedTime = Number(project.editedTime || 0);
    const creationTime = Number(project.creationTime || 0);
    const timestamp = editedTime || creationTime;

    if (!Number.isFinite(timestamp) || timestamp <= 0)
      return "Recently created";
    return editedTime === 0
      ? `Created ${format(timestamp)}`
      : `Modified ${format(timestamp)}`;
  };

  const fetchProjects = async () => {
    try {
      const projects = await legacyProjects.getProjects();
      setUserProjects([...projects].reverse());
    } catch (error) {
      if (isUnauthorizedError(error)) navigate("/auth");
      console.error(error);
      toast.error("Failed to fetch projects.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectName.trim() || !projectLanguage || !isProjectNameAvailable)
      return;

    setIsLoading(true);
    try {
      const result = await legacyProjects.createProject({
        projectName: projectName.trim(),
        language: projectLanguage,
        visibility: "private",
      });
      const createdName = result.project?.name || projectName.trim();
      toast.success(`Project "${createdName}" created successfully!`);
      setIsDialogOpen(false);
      setProjectName("");
      setProjectLanguage("");
      fetchProjects(); // Refetch to get the latest list
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const projectToDelete = userProjects.find((p) => p._id === id);
    if (!projectToDelete) return;

    const promise = legacyProjects.deleteProject(id);

    toast.promise(promise, {
      loading: "Deleting project...",
      success: () => {
        fetchProjects(); // Refetch projects after deletion
        return `Project "${projectToDelete.name}" deleted.`;
      },
      error: "Failed to delete project.",
    });
  };

  const handleSelectProject = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const filteredProjects = userProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Toaster position="bottom-right" theme="dark" />
      <Sidebar user={userData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <MobileSidebar user={userData} />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNewProject={() => setIsDialogOpen(true)}
            />
            <CreateProjectDialog
              projectName={projectName}
              onProjectNameChange={setProjectName}
              projectLanguage={projectLanguage}
              onProjectLanguageChange={setProjectLanguage}
              isProjectNameAvailable={isProjectNameAvailable}
              isLoading={isLoading}
              onSubmit={handleCreateProject}
            />
          </Dialog>

          <AnimatePresence>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-2"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onSelect={handleSelectProject}
                  timeLabel={getProjectTimeLabel(project)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try adjusting your search."
                  : "Get started by creating a new project."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
