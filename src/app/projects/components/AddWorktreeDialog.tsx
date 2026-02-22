import { useMutation } from "@tanstack/react-query";
import { GitBranch, Plus } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { honoClient } from "@/lib/api/client";
import { useProjects } from "../hooks/useProjects";

const normalizeSeparators = (value: string) => value.replace(/\\/g, "/");

const splitParentAndName = (path: string) => {
  const normalizedPath = normalizeSeparators(path).replace(/\/$/, "");
  const lastSlashIndex = normalizedPath.lastIndexOf("/");

  if (lastSlashIndex <= 0) {
    return { parentPath: normalizedPath, repositoryName: normalizedPath };
  }

  return {
    parentPath: normalizedPath.slice(0, lastSlashIndex),
    repositoryName: normalizedPath.slice(lastSlashIndex + 1),
  };
};

export const buildWorktreePath = (
  repositoryPath: string,
  worktreeName: string,
): string => {
  const { parentPath, repositoryName } = splitParentAndName(repositoryPath);
  const normalizedName = worktreeName.trim();
  const suffix = normalizedName.length > 0 ? normalizedName : "worktree";
  const combinedPath = `${parentPath}/${repositoryName}-${suffix}`;

  const prefersBackslash =
    repositoryPath.includes("\\") && !repositoryPath.includes("/");

  return prefersBackslash ? combinedPath.replace(/\//g, "\\") : combinedPath;
};

export const AddWorktreeDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedRepositoryPath, setSelectedRepositoryPath] =
    useState<string>("");
  const [worktreeName, setWorktreeName] = useState("");
  const [baseBranch, setBaseBranch] = useState("staging");
  const {
    data: { projects },
  } = useProjects();

  const repositories = useMemo(
    () =>
      projects
        .map((project) => project.meta.projectPath)
        .filter((path): path is string => path !== null),
    [projects],
  );

  const worktreePath = useMemo(() => {
    if (!selectedRepositoryPath) {
      return "";
    }
    return buildWorktreePath(selectedRepositoryPath, worktreeName);
  }, [selectedRepositoryPath, worktreeName]);

  const addWorktreeMutation = useMutation({
    mutationFn: async () => {
      const response = await honoClient.api.projects.worktrees.$post({
        json: {
          repositoryPath: selectedRepositoryPath,
          worktreeName: worktreeName.trim(),
          baseBranch: baseBranch.trim(),
          targetPath: worktreePath,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create worktree");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Worktree created successfully");
      setOpen(false);
      setWorktreeName("");
      setBaseBranch("staging");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create worktree",
      );
    },
  });

  const canSubmit =
    selectedRepositoryPath.length > 0 &&
    worktreeName.trim().length > 0 &&
    baseBranch.trim().length > 0 &&
    worktreePath.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="add-worktree-button">
          <GitBranch className="w-4 h-4 mr-2" />
          Add Worktree
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="add-worktree-modal">
        <DialogHeader>
          <DialogTitle>Add Git Worktree</DialogTitle>
          <DialogDescription>
            Create a new worktree with a new branch based on origin/
            {baseBranch.trim() || "staging"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="worktree-repository">Repository</Label>
            <Select
              value={selectedRepositoryPath}
              onValueChange={setSelectedRepositoryPath}
            >
              <SelectTrigger id="worktree-repository">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repositoryPath) => (
                  <SelectItem key={repositoryPath} value={repositoryPath}>
                    {splitParentAndName(repositoryPath).repositoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="worktree-name">Worktree Name (Branch Name)</Label>
            <Input
              id="worktree-name"
              value={worktreeName}
              onChange={(e) => setWorktreeName(e.target.value)}
              placeholder="e.g. feature-my-feature"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="worktree-base-branch">Base Branch</Label>
            <Input
              id="worktree-base-branch"
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              placeholder="staging"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="worktree-path">Path</Label>
            <Input id="worktree-path" value={worktreePath} readOnly />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={addWorktreeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => await addWorktreeMutation.mutateAsync()}
            disabled={!canSubmit || addWorktreeMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Worktree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
