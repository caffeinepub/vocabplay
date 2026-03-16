import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VocabEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useListVocabSets() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["vocabSets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVocabSets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVocabSet(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vocabSet", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getVocabSet(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateVocabSet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      entries,
    }: { id: string; name: string; entries: VocabEntry[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.createVocabSet(id, name, entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabSets"] });
    },
  });
}

export function useUpdateVocabSet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      entries,
    }: { id: string; entries: VocabEntry[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateVocabSet(id, entries);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vocabSets"] });
      queryClient.invalidateQueries({ queryKey: ["vocabSet", variables.id] });
    },
  });
}

export function useDeleteVocabSet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteVocabSet(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabSets"] });
    },
  });
}
