import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckIcon,
  FilterIcon,
  GitBranchIcon,
  ListIcon,
  SearchIcon,
} from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProjects } from "@/app/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { honoClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type AddWorktreeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

const buildWorktreePath = (
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

export const AddWorktreeModal: FC<AddWorktreeModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const {
    data: { projects },
  } = useProjects();
  const [tabValue, setTabValue] = useState<"existing" | "new">("existing");
  const [searchValue, setSearchValue] = useState("");
  const [excludeInquiry, setExcludeInquiry] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRepositoryPath, setSelectedRepositoryPath] =
    useState<string>("");
  const [worktreeName, setWorktreeName] = useState("");
  const [baseBranch, setBaseBranch] = useState("staging");

  const repositories = useMemo(
    () =>
      projects
        .map((project) => ({
          id: project.id,
          name: project.meta.projectName ?? project.claudeProjectPath,
          path: project.meta.projectPath ?? project.claudeProjectPath,
        }))
        .filter((project) => project.path.length > 0),
    [projects],
  );

  const filteredRepositories = useMemo(() => {
    return repositories.filter((repository) => {
      const text = `${repository.name} ${repository.path}`.toLowerCase();
      const matchSearch = text.includes(searchValue.trim().toLowerCase());
      const matchExclude = excludeInquiry ? !text.includes("inquiry") : true;
      return matchSearch && matchExclude;
    });
  }, [excludeInquiry, repositories, searchValue]);

  const selectedCount = selectedProjectId.length > 0 ? 1 : 0;

  const worktreePath = useMemo(() => {
    if (!selectedRepositoryPath) {
      return "";
    }
    return buildWorktreePath(selectedRepositoryPath, worktreeName);
  }, [selectedRepositoryPath, worktreeName]);

  const createWorktreeMutation = useMutation({
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
      toast.success("Worktreeを追加しました");
      onOpenChange(false);
      setWorktreeName("");
      setBaseBranch("staging");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Worktreeの追加に失敗しました",
      );
    },
  });

  const canCreate =
    selectedRepositoryPath.length > 0 &&
    worktreeName.trim().length > 0 &&
    baseBranch.trim().length > 0 &&
    worktreePath.length > 0;

  const handleAddExistingWorkspace = async () => {
    if (!selectedProjectId) {
      return;
    }
    onOpenChange(false);
    await navigate({
      to: "/projects/$projectId/session",
      params: { projectId: selectedProjectId },
      search: {
        tab: "sessions",
      },
    });
  };

  const handleCreateWorktree = async () => {
    await createWorktreeMutation.mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/60 bg-background/95 p-0">
        <DialogHeader className="px-6 pt-5">
          <DialogTitle className="text-xl font-semibold">
            Worktreeを追加
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs
            value={tabValue}
            onValueChange={(value) =>
              setTabValue(value === "new" ? "new" : "existing")
            }
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60">
              <TabsTrigger value="existing">
                <ListIcon className="h-4 w-4" />
                既存を選択
              </TabsTrigger>
              <TabsTrigger value="new">
                <GitBranchIcon className="h-4 w-4" />
                新規作成
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="ブランチ名 / パス / PR名 で検索..."
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <FilterIcon className="mr-1 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全員</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="exclude-inquiry"
                  checked={excludeInquiry}
                  onCheckedChange={(checked) =>
                    setExcludeInquiry(checked === true)
                  }
                />
                <Label htmlFor="exclude-inquiry">inquiry系を除外</Label>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-border/70 p-2">
                <div className="space-y-2">
                  {filteredRepositories.map((repository) => {
                    const isSelected = selectedProjectId === repository.id;
                    return (
                      <button
                        key={repository.id}
                        type="button"
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                          isSelected
                            ? "border-primary/70 bg-primary/10"
                            : "border-border/70 hover:bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedProjectId(isSelected ? "" : repository.id)
                        }
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border",
                            )}
                          >
                            {isSelected && <CheckIcon className="h-3 w-3" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {repository.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {repository.path}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredRepositories.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                      該当するワークスペースがありません
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="new-worktree-repository">Repository</Label>
                <Select
                  value={selectedRepositoryPath}
                  onValueChange={setSelectedRepositoryPath}
                >
                  <SelectTrigger id="new-worktree-repository">
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repository) => (
                      <SelectItem key={repository.id} value={repository.path}>
                        {repository.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-worktree-name">Worktree Name</Label>
                <Input
                  id="new-worktree-name"
                  value={worktreeName}
                  onChange={(event) => setWorktreeName(event.target.value)}
                  placeholder="feature/my-worktree"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-worktree-base-branch">Base Branch</Label>
                <Input
                  id="new-worktree-base-branch"
                  value={baseBranch}
                  onChange={(event) => setBaseBranch(event.target.value)}
                  placeholder="staging"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-worktree-path">Path</Label>
                <Input id="new-worktree-path" value={worktreePath} readOnly />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          {tabValue === "existing" ? (
            <Button
              onClick={handleAddExistingWorkspace}
              disabled={selectedCount === 0}
            >
              追加 ({selectedCount})
            </Button>
          ) : (
            <Button
              onClick={handleCreateWorktree}
              disabled={!canCreate || createWorktreeMutation.isPending}
            >
              追加
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
