
import {
  ExternalLink,
  Trash2,
  Clock,
  Lock,
  Globe,
  Users,
  Code,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LANGUAGE_CATALOG,
  type Language,
} from "@/lib/languages";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

type ProjectCardProps = {
  project: ProjectSummary;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  timeLabel: string;
  viewMode: "grid" | "list";
};

export const ProjectCard = ({
  project,
  onDelete,
  onSelect,
  timeLabel,
  viewMode,
}: ProjectCardProps) => {
  const languageMeta = LANGUAGE_CATALOG[project.language];
  const languageLabel = languageMeta?.label ?? project.language;
  const LanguageIcon = Code;
  const visibilityLabel = project.visibility
    ? `${project.visibility.charAt(0).toUpperCase()}${project.visibility.slice(1)}`
    : "Private";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (viewMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        layout
        className="w-full"
      >
        <div
          onClick={() => onSelect(project._id)}
          className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-4">
            <LanguageIcon className="w-6 h-6 text-muted-foreground" />
            <span className="font-medium">{project.name}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {project.visibility === "private" ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>{visibilityLabel}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{timeLabel}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{project.collaborators?.length || 0}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      className="relative group"
    >
      <div
        className={cn(
          "absolute -inset-0.5 rounded-xl blur-sm bg-gradient-to-r from-primary to-secondary opacity-25 group-hover:opacity-50 transition duration-1000",
          "group-hover:duration-200 animate-tilt"
        )}
      />
      <div className="relative flex flex-col h-full bg-card p-6 rounded-xl shadow-md border border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <LanguageIcon className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {project.name}
            </h3>
          </div>
          <Badge
            variant={
              project.visibility === "private" ? "secondary" : "outline"
            }
            className="capitalize"
          >
            {visibilityLabel}
          </Badge>
        </div>

        <p className="mt-4 text-sm text-muted-foreground flex-grow">
          A collaborative project for{" "}
          <span className="font-medium text-foreground">
            {languageLabel}
          </span>
          .
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{timeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>{project.collaborators?.length || 0} collaborators</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            onClick={() => onSelect(project._id)}
            className="flex-1"
            variant="outline"
          >
            Open <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(project._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
