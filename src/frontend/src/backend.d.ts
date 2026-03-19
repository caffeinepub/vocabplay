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
    id: string;
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
    addStudentSticker(name: string, password: string, sticker: string): Promise<void>;
    clearGameResults(): Promise<void>;
    createStudentAccount(name: string, password: string): Promise<void>;
    createVocabSet(id: string, name: string, entries: Array<VocabEntry>): Promise<void>;
    deleteVocabSet(id: string): Promise<void>;
    getStudentGameResults(name: string, password: string): Promise<Array<GameResult>>;
    getStudentStickers(name: string, password: string): Promise<Array<string>>;
    getVocabSet(id: string): Promise<VocabSet>;
    listGameResults(): Promise<Array<GameResult>>;
    listStudentNames(): Promise<Array<string>>;
    listVocabSets(): Promise<Array<[string, string]>>;
    loginStudent(name: string, password: string): Promise<boolean>;
    recordGameResult(studentName: string, setId: string, setName: string, gameType: string, score: bigint, total: bigint): Promise<void>;
    updateVocabSet(id: string, name: string, entries: Array<VocabEntry>): Promise<void>;
}
