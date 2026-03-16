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
export interface backendInterface {
    createVocabSet(id: string, name: string, entries: Array<VocabEntry>): Promise<void>;
    deleteVocabSet(id: string): Promise<void>;
    getVocabSet(id: string): Promise<VocabSet>;
    listVocabSets(): Promise<Array<[string, string]>>;
    updateVocabSet(id: string, entries: Array<VocabEntry>): Promise<void>;
}
