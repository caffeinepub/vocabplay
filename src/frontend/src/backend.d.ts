import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VocabSet {
    name: string;
    entries: Array<VocabEntry>;
}
export interface VocabEntry {
    word: string;
    definition: string;
}
export interface GameResult {
    setName: string;
    total: bigint;
    studentName: string;
    score: bigint;
    setId: string;
    timestamp: bigint;
    gameType: string;
}
export interface backendInterface {
    clearGameResults(): Promise<void>;
    createVocabSet(id: string, name: string, entries: Array<VocabEntry>): Promise<void>;
    deleteVocabSet(id: string): Promise<void>;
    getVocabSet(id: string): Promise<VocabSet>;
    listGameResults(): Promise<Array<GameResult>>;
    listVocabSets(): Promise<Array<[string, string]>>;
    recordGameResult(studentName: string, setId: string, setName: string, gameType: string, score: bigint, total: bigint): Promise<void>;
    updateVocabSet(id: string, entries: Array<VocabEntry>): Promise<void>;
}
