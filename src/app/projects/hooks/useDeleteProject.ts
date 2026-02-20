import { useMutation, useQueryClient } from "@tanstack/react-query";
import { honoClient } from "@/lib/api/client";
import { projectListQuery } from "@/lib/api/queries";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const response = await honoClient.api.projects[":projectId"].$delete({
        param: { projectId },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error("Failed to delete project");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectListQuery.queryKey,
      });
    },
  });
};
