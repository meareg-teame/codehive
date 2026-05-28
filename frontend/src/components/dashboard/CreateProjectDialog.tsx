
import { useState, type FormEvent } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  PROJECT_LANGUAGE_OPTIONS,
  type Language,
} from "@/lib/languages";

type CreateProjectDialogProps = {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  projectLanguage: Language | "";
  onProjectLanguageChange: (language: Language | "") => void;
  isProjectNameAvailable: boolean;
  isLoading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export const CreateProjectDialog = ({
  projectName,
  onProjectNameChange,
  projectLanguage,
  onProjectLanguageChange,
  isProjectNameAvailable,
  isLoading,
  onSubmit,
}: CreateProjectDialogProps) => {
  return (
    <DialogContent className="sm:max-w-[425px] bg-card border-border">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Start a new collaborative project. Choose a name and language to get
          started.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <div className="col-span-3">
            <Input
              id="name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full"
              placeholder="My awesome project"
              required
            />
            {!isProjectNameAvailable && (
              <p className="text-red-500 text-xs mt-1">
                A project with this name already exists.
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="language" className="text-right">
            Language
          </Label>
          <div className="col-span-3">
            <Select
              onValueChange={(value) =>
                onProjectLanguageChange(value as Language)
              }
              value={projectLanguage}
              required
            >
              <SelectTrigger className="w-full">
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
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading || !isProjectNameAvailable}>
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
