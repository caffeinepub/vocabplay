import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playWrong } from "../utils/soundEffects";

interface MatchingGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  onBack: () => void;
}

type Tile = { id: string; text: string; type: "word" | "def"; pairId: string };

const BATCH_SIZE = 5;

export function MatchingGame({
  entries,
  setId,
  setName,
  onBack,
}: MatchingGameProps) {
  const [allEntries] = useState(() => shuffleArray(entries));
  const [batchIndex, setBatchIndex] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [totalMatched, setTotalMatched] = useState(0);
  const [finished, setFinished] = useState(false);
  const [muted, toggleMute] = useSoundToggle();
  const [recorded, setRecorded] = useState(false);
  const recordMutation = useRecordGameResult();

  const totalBatches = Math.ceil(allEntries.length / BATCH_SIZE);
  const currentBatch = allEntries.slice(
    batchIndex * BATCH_SIZE,
    (batchIndex + 1) * BATCH_SIZE,
  );

  const [tiles, setTiles] = useState<Tile[]>(() => {
    const batch = allEntries.slice(0, BATCH_SIZE);
    return shuffleArray([
      ...batch.map((e) => ({
        id: `w-${e.word}`,
        text: e.word,
        type: "word" as const,
        pairId: e.word,
      })),
      ...batch.map((e) => ({
        id: `d-${e.word}`,
        text: e.definition,
        type: "def" as const,
        pairId: e.word,
      })),
    ]);
  });

  useEffect(() => {
    if (finished && !recorded) {
      const studentName = sessionStorage.getItem("studentName") ?? "Unknown";
      recordMutation.mutate({
        studentName,
        setId,
        setName,
        gameType: "Matching",
        score: BigInt(totalMatched),
        total: BigInt(allEntries.length),
      });
      setRecorded(true);
    }
  }, [
    finished,
    recorded,
    totalMatched,
    allEntries.length,
    setId,
    setName,
    recordMutation.mutate,
  ]);

  const loadBatch = (bIdx: number) => {
    const batch = allEntries.slice(bIdx * BATCH_SIZE, (bIdx + 1) * BATCH_SIZE);
    setTiles(
      shuffleArray([
        ...batch.map((e) => ({
          id: `w-${e.word}-${bIdx}`,
          text: e.word,
          type: "word" as const,
          pairId: e.word,
        })),
        ...batch.map((e) => ({
          id: `d-${e.word}-${bIdx}`,
          text: e.definition,
          type: "def" as const,
          pairId: e.word,
        })),
      ]),
    );
    setMatchedPairs(new Set());
    setSelectedTile(null);
    setWrongPair(null);
  };

  const handleTileClick = (tile: Tile) => {
    if (matchedPairs.has(tile.pairId)) return;
    if (wrongPair) return;

    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    if (
      selectedTile.pairId === tile.pairId &&
      selectedTile.type !== tile.type
    ) {
      const newMatched = new Set([...matchedPairs, tile.pairId]);
      setMatchedPairs(newMatched);
      setSelectedTile(null);
      const newTotal = totalMatched + 1;
      setTotalMatched(newTotal);
      playCorrect();

      if (newMatched.size === currentBatch.length) {
        if (batchIndex + 1 >= totalBatches) {
          setTimeout(() => setFinished(true), 600);
        } else {
          setTimeout(() => {
            setBatchIndex((b) => b + 1);
            loadBatch(batchIndex + 1);
          }, 800);
        }
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongPair([selectedTile.id, tile.id]);
      playWrong();
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTile(null);
      }, 700);
    }
  };

  const handleRestart = () => {
    setBatchIndex(0);
    setMatchedPairs(new Set());
    setSelectedTile(null);
    setWrongPair(null);
    setMistakes(0);
    setTotalMatched(0);
    setFinished(false);
    setRecorded(false);
    loadBatch(0);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl border-2 border-border shadow-game p-8 text-center"
        >
          <div className="text-6xl mb-4">🧩</div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            All Matched!
          </h2>
          <p className="text-muted-foreground mb-6">{setName}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-success/15 rounded-2xl p-4">
              <div className="font-display font-bold text-3xl text-success">
                {totalMatched}
              </div>
              <div className="text-sm text-muted-foreground">Matched</div>
            </div>
            <div className="bg-destructive/10 rounded-2xl p-4">
              <div className="font-display font-bold text-3xl text-destructive">
                {mistakes}
              </div>
              <div className="text-sm text-muted-foreground">Mistakes</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              data-ocid="results.replay_button"
              onClick={handleRestart}
              className="w-full gap-2 font-semibold"
            >
              <RotateCcw className="h-4 w-4" /> Play Again
            </Button>
            <Button
              data-ocid="results.back_button"
              variant="ghost"
              onClick={onBack}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Games
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">🧩 Matching</span>
              <span className="text-muted-foreground">
                Round {batchIndex + 1}/{totalBatches} · {mistakes} mistakes
              </span>
            </div>
          </div>
          <SoundToggle muted={muted} onToggle={toggleMute} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Tap a word, then tap its matching definition
        </p>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {tiles.map((tile) => {
              const isMatched = matchedPairs.has(tile.pairId);
              const isSelected = selectedTile?.id === tile.id;
              const isWrong = wrongPair?.includes(tile.id);
              let tileClass = "bg-card border-2 border-border text-foreground";
              if (isMatched)
                tileClass = "bg-success/20 border-success text-success";
              else if (isWrong)
                tileClass =
                  "bg-destructive/15 border-destructive text-destructive animate-shake";
              else if (isSelected)
                tileClass =
                  "bg-primary/15 border-primary text-primary ring-2 ring-primary/30";

              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isMatched ? 0.5 : 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={!isMatched ? { scale: 1.02 } : {}}
                  whileTap={!isMatched ? { scale: 0.97 } : {}}
                  onClick={() => !isMatched && handleTileClick(tile)}
                  disabled={isMatched}
                  className={`${tileClass} rounded-2xl p-4 text-sm font-body text-center shadow-game transition-colors duration-200 min-h-[4rem] flex items-center justify-center`}
                >
                  <span className="leading-snug">{tile.text}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
