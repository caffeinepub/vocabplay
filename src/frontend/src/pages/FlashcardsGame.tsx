import { PronounceButton } from "@/components/PronounceButton";
import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, RotateCcw, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playWrong } from "../utils/soundEffects";

interface FlashcardsGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  onBack: () => void;
}

function FlipCard({
  entry,
  onKnow,
  onLearn,
}: {
  entry: VocabEntry;
  onKnow: () => void;
  onLearn: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-6">
      <button
        type="button"
        data-ocid="flashcard.flip_button"
        className="flip-card w-full cursor-pointer bg-transparent border-none p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-3xl"
        onClick={() => setFlipped((f) => !f)}
        aria-label={
          flipped
            ? "Showing definition, click to see word"
            : "Showing word, click to see definition"
        }
      >
        <div
          className="flip-card-inner w-full h-56 md:h-64 relative"
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.5s",
          }}
        >
          {/* Front */}
          <div
            className="flip-card-front absolute inset-0 bg-card border-2 border-primary/30 rounded-3xl shadow-game flex flex-col items-center justify-center p-8 gap-4"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Word
            </span>
            <span className="font-display font-extrabold text-4xl md:text-5xl text-center text-foreground">
              {entry.word}
            </span>
            <div className="flex items-center gap-2">
              <PronounceButton
                word={entry.word}
                data-ocid="flashcard.pronounce_button"
              />
              <span className="text-sm text-muted-foreground">
                Tap to reveal definition
              </span>
            </div>
          </div>
          {/* Back */}
          <div
            className="flip-card-back absolute inset-0 bg-primary/10 border-2 border-primary/40 rounded-3xl shadow-game flex flex-col items-center justify-center p-8 gap-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Definition
            </span>
            <span className="font-body text-xl md:text-2xl text-center text-foreground leading-relaxed">
              {entry.definition}
            </span>
            <span className="text-sm font-semibold text-primary mt-2">
              {entry.word}
            </span>
          </div>
        </div>
      </button>

      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Button
            data-ocid="flashcard.unknown_button"
            variant="outline"
            className="flex-1 gap-2 border-2 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold"
            onClick={onLearn}
          >
            <X className="h-4 w-4" /> Still Learning
          </Button>
          <Button
            data-ocid="flashcard.known_button"
            className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90 font-semibold"
            onClick={onKnow}
          >
            <Check className="h-4 w-4" /> Got It!
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export function FlashcardsGame({
  entries,
  setId,
  setName,
  onBack,
}: FlashcardsGameProps) {
  const [cards, setCards] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [replayMode, setReplayMode] = useState(false);
  const [muted, toggleMute] = useSoundToggle();
  const [recorded, setRecorded] = useState(false);
  const recordMutation = useRecordGameResult();

  useEffect(() => {
    if (finished && !recorded) {
      const studentName = sessionStorage.getItem("studentName") ?? "Unknown";
      recordMutation.mutate({
        studentName,
        setId,
        setName,
        gameType: "Flashcards",
        score: BigInt(known.size),
        total: BigInt(cards.length),
      });
      setRecorded(true);
    }
  }, [
    finished,
    recorded,
    known.size,
    cards.length,
    setId,
    setName,
    recordMutation.mutate,
  ]);

  const progress = (currentIndex / cards.length) * 100;

  const handleNext = (isKnown: boolean) => {
    if (isKnown) {
      setKnown((prev) => new Set([...prev, currentIndex]));
      playCorrect();
    } else {
      setUnknown((prev) => new Set([...prev, currentIndex]));
      playWrong();
    }
    if (currentIndex + 1 >= cards.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleReplayUnknowns = () => {
    const unknownCards = cards.filter((_, i) => unknown.has(i));
    setCards(shuffleArray(unknownCards));
    setCurrentIndex(0);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
    setReplayMode(true);
    setRecorded(false);
  };

  const handleRestart = () => {
    setCards(shuffleArray(entries));
    setCurrentIndex(0);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
    setReplayMode(false);
    setRecorded(false);
  };

  if (finished) {
    const knownCount = known.size;
    const unknownCount = unknown.size;
    const score = Math.round((knownCount / cards.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl border-2 border-border shadow-game p-8 text-center"
        >
          <div className="text-6xl mb-4">
            {score >= 80 ? "🏆" : score >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            {replayMode ? "Round Complete!" : "Flashcards Done!"}
          </h2>
          <p className="text-muted-foreground mb-6">{setName}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-success/15 rounded-2xl p-4">
              <div className="font-display font-bold text-3xl text-success">
                {knownCount}
              </div>
              <div className="text-sm text-muted-foreground">Got it!</div>
            </div>
            <div className="bg-destructive/10 rounded-2xl p-4">
              <div className="font-display font-bold text-3xl text-destructive">
                {unknownCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Still learning
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {unknownCount > 0 && (
              <Button
                data-ocid="results.replay_button"
                onClick={handleReplayUnknowns}
                className="w-full gap-2 font-semibold"
              >
                <RotateCcw className="h-4 w-4" /> Replay {unknownCount} Unknown
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleRestart}
              className="w-full gap-2"
            >
              <Trophy className="h-4 w-4" /> Restart All
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
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-semibold">🃏 Flashcards</span>
              <span className="text-muted-foreground">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <SoundToggle muted={muted} onToggle={toggleMute} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <FlipCard
              entry={cards[currentIndex]}
              onKnow={() => handleNext(true)}
              onLearn={() => handleNext(false)}
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex gap-2 text-sm text-muted-foreground justify-center">
          <span className="bg-success/15 text-success rounded-full px-3 py-1 font-semibold">
            {known.size} Got it
          </span>
          <span className="bg-destructive/10 text-destructive rounded-full px-3 py-1 font-semibold">
            {unknown.size} Learning
          </span>
        </div>
      </main>
    </div>
  );
}
