import { PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddWorktreeModal } from "./AddWorktreeModal";

export const SessionsTab: FC = () => {
  const [isAddWorktreeModalOpen, setIsAddWorktreeModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="font-semibold text-sm text-sidebar-foreground">
            ワークスペース
          </h2>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs gap-1.5"
            onClick={() => setIsAddWorktreeModalOpen(true)}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            追加
          </Button>
        </div>
        <p className="text-[10px] text-sidebar-foreground/60">
          セッション一覧はチャット本文の上部に表示されます
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#070f24]">
        <button
          type="button"
          className={cn(
            "block w-full rounded-xl p-2.5 transition-all duration-200 border border-blue-800/60 hover:border-blue-500/80 bg-[#0b1a3d] hover:bg-[#0f2456]",
          )}
          onClick={() => setIsAddWorktreeModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-blue-100">新規</p>
            </div>
          </div>
        </button>
      </div>
      <AddWorktreeModal
        open={isAddWorktreeModalOpen}
        onOpenChange={setIsAddWorktreeModalOpen}
      />
    </div>
  );
};
