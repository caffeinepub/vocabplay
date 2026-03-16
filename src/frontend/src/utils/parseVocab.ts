import type { VocabEntry } from "../backend.d";

export function parseVocabList(text: string): VocabEntry[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const entries: VocabEntry[] = [];

  for (const line of lines) {
    // Try: word - definition
    let match = line.match(/^(.+?)\s*[-\u2013\u2014]\s*(.+)$/);
    if (match) {
      entries.push({ word: match[1].trim(), definition: match[2].trim() });
    } else {
      // Try: word: definition
      match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        entries.push({ word: match[1].trim(), definition: match[2].trim() });
      } else {
        // Try: word = definition
        match = line.match(/^(.+?)=\s*(.+)$/);
        if (match) {
          entries.push({ word: match[1].trim(), definition: match[2].trim() });
        }
      }
    }
  }

  return entries;
}

export function generateId(): string {
  return `vs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
