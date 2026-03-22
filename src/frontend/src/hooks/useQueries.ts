import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WikiPage } from "../backend.d";
import { useActor } from "./useActor";

export interface WikiDraft {
  key: string;
  title: string;
  body: string;
  tags: string[];
  savedAt: bigint;
}

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

export function useGetPageByTitle(title: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<WikiPage | null>({
    queryKey: ["page-by-title", title],
    queryFn: async () => {
      if (!actor || !title) return null;
      const result = await actor.getPageByTitle(title);
      // Motoko optional: [] | [WikiPage]
      return (result as unknown as WikiPage[])[0] ?? null;
    },
    enabled: !!actor && !isFetching && !!title,
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
      queryClient.invalidateQueries({ queryKey: ["page-by-title"] });
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

export function useGetDraft(key: string) {
  const { actor, isFetching } = useActor();
  return useQuery<WikiDraft | null>({
    queryKey: ["draft", key],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getDraft(key);
      return result[0] ?? null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useSaveDraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      title,
      body,
      tags,
    }: {
      key: string;
      title: string;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).saveDraft(key, title, body, tags);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft", variables.key] });
    },
  });
}

export function useDeleteDraft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteDraft(key);
    },
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({ queryKey: ["draft", key] });
    },
  });
}
