import { PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
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
          チャット履歴は本文上部で確認できます
        </p>
      </div>

      <div className="flex-1 bg-[#070f24]" />
      <AddWorktreeModal
        open={isAddWorktreeModalOpen}
        onOpenChange={setIsAddWorktreeModalOpen}
      />
    </div>
  );
};
