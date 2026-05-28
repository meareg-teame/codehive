
import { Search, LayoutGrid, List, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

type ToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onNewProject: () => void;
};

export const Toolbar = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onNewProject,
}: ToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="relative w-full md:w-auto md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="pl-10 w-full bg-transparent border-border focus:ring-primary"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("list")}
        >
          <List className="w-5 h-5" />
        </Button>
        <DialogTrigger asChild>
          <Button onClick={onNewProject} className="ml-4">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
};
