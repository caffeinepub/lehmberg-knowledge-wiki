import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WikiPage } from "../backend.d";
import { useActor } from "./useActor";

export function useListPages() {
  const { actor, isFetching } = useActor();
  return useQuery<WikiPage[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPage(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<WikiPage | null>({
    queryKey: ["page", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPage(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetPagesByTag(tag: string) {
  const { actor, isFetching } = useActor();
  return useQuery<WikiPage[]>({
    queryKey: ["pages-by-tag", tag],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPagesByTag(tag);
    },
    enabled: !!actor && !isFetching && !!tag,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      tags,
    }: {
      title: string;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPage(title, body, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useUpdatePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      body,
      tags,
    }: {
      id: bigint;
      title: string;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePage(id, title, body, tags);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({
        queryKey: ["page", variables.id.toString()],
      });
    },
  });
}

export function useDeletePage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useInitialize() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initialize();
    },
  });
}
