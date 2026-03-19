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
      name,
      entries,
    }: { id: string; name: string; entries: VocabEntry[] }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateVocabSet(id, name, entries);
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

export function useListGameResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["gameResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGameResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordGameResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentName,
      setId,
      setName,
      gameType,
      score,
      total,
    }: {
      studentName: string;
      setId: string;
      setName: string;
      gameType: string;
      score: bigint;
      total: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordGameResult(
        studentName,
        setId,
        setName,
        gameType,
        score,
        total,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameResults"] });
    },
  });
}

export function useClearGameResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.clearGameResults();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameResults"] });
    },
  });
}

export function useLoginStudent() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      password,
    }: { name: string; password: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.loginStudent(name, password);
    },
  });
}

export function useCreateStudentAccount() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      password,
    }: { name: string; password: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStudentAccount(name, password);
    },
  });
}

export function useAddStudentSticker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      password,
      sticker,
    }: { name: string; password: string; sticker: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudentSticker(name, password, sticker);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studentStickers", variables.name],
      });
    },
  });
}

export function useGetStudentStickers(name: string, password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["studentStickers", name],
    queryFn: async () => {
      if (!actor || !name || !password) return [];
      return actor.getStudentStickers(name, password);
    },
    enabled: !!actor && !isFetching && !!name && !!password,
  });
}

export function useGetStudentGameResults(name: string, password: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentGameResults", name],
    queryFn: async () => {
      if (!actor || !name || !password) return [];
      return actor.getStudentGameResults(name, password);
    },
    enabled: !!actor && !isFetching && !!name && !!password,
  });
}
