import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useAddStudentSticker, useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playFinish, playWrong } from "../utils/soundEffects";

interface ListenChooseGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  studentName?: string;
  onBack: () => void;
  onViewStickers?: () => void;
}

function speakWord(word: string, rate = 1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function buildChoices(
  entries: VocabEntry[],
  targetIndex: number,
  allEntries: VocabEntry[],
): string[] {
  const target = entries[targetIndex].word;
  const distractors = allEntries
    .filter((e) => e.word !== target)
    .map((e) => e.word);
  const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
  return shuffleArray([target, ...shuffledDistractors]);
}

function pickSticker(pct: number): string {
  const pools: { min: number; stickers: string[] }[] = [
    { min: 90, stickers: ["🏆", "🥇", "👑", "🌟", "🎖️", "💫", "🎊"] },
    { min: 70, stickers: ["⭐", "🎯", "💎", "🦋", "🌈", "🎠", "🎵"] },
    { min: 50, stickers: ["🌸", "🍀", "🎨", "🌺", "🦄", "🍭", "🎀"] },
    { min: 0, stickers: ["🌱", "🌿", "🍃", "🌻", "🌼", "🌾", "🐣"] },
  ];
  const pool = pools.find((p) => pct >= p.min)!;
  return pool.stickers[Math.floor(Math.random() * pool.stickers.length)];
}

export function ListenChooseGame({
  entries,
  setId,
  setName,
  onBack,
  onViewStickers,
}: ListenChooseGameProps) {
  const [shuffled] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>(() =>
    buildChoices(shuffled, 0, entries),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [muted, toggleMute] = useSoundToggle();
  const [recorded, setRecorded] = useState(false);
  const stickerAdded = useRef(false);
  const recordMutation = useRecordGameResult();
  const addStickerMutation = useAddStudentSticker();
  const addStickerMutate = addStickerMutation.mutate;

  const current = shuffled[currentIndex];
  const progress = (currentIndex / shuffled.length) * 100;
  const scorePercent = Math.round((score / shuffled.length) * 100);
  const earnedSticker = pickSticker(scorePercent);

  useEffect(() => {
    const timeout = setTimeout(() => speakWord(current.word), 300);
    return () => clearTimeout(timeout);
  }, [current.word]);

  useEffect(() => {
    setChoices(buildChoices(shuffled, currentIndex, entries));
  }, [currentIndex, shuffled, entries]);

  useEffect(() => {
    if (finished && !recorded) {
      const studentName = sessionStorage.getItem("studentName") ?? "Unknown";
      recordMutation.mutate({
        studentName,
        setId,
        setName,
        gameType: "Listen & Choose",
        score: BigInt(score),
        total: BigInt(shuffled.length),
      });
      setRecorded(true);
    }
  }, [
    finished,
    recorded,
    score,
    shuffled.length,
    setId,
    setName,
    recordMutation.mutate,
  ]);

  useEffect(() => {
    if (finished && !stickerAdded.current) {
      stickerAdded.current = true;
      if (!muted) playFinish();
      const name = sessionStorage.getItem("studentName");
      const password = sessionStorage.getItem("studentPassword");
      if (name && password) {
        addStickerMutate({ name, password, sticker: earnedSticker });
      }
    }
  }, [finished, muted, earnedSticker, addStickerMutate]);

  const handleChoice = (word: string) => {
    if (selected) return;
    setSelected(word);
    const isCorrect = word === current.word;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (!muted) playCorrect();
    } else {
      if (!muted) playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffled.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setRecorded(false);
    stickerAdded.current = false;
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl border-2 border-border shadow-game p-8 text-center"
        >
          <div className="text-6xl mb-4">
            {scorePercent >= 80 ? "🎯" : scorePercent >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            Listen &amp; Choose Done!
          </h2>
          <p className="text-muted-foreground mb-6">{setName}</p>
          <div className="bg-primary/10 rounded-2xl p-6 mb-4">
            <div className="font-display font-bold text-5xl text-primary">
              {scorePercent}%
            </div>
            <div className="text-muted-foreground mt-1">
              {score} / {shuffled.length} correct
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-4 mb-6"
          >
            <p className="text-sm font-semibold text-yellow-700 mb-1">
              You earned a sticker!
            </p>
            <div className="text-7xl">{earnedSticker}</div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {onViewStickers && (
              <Button
                data-ocid="listen_choose_results.view_stickers_button"
                onClick={onViewStickers}
                variant="outline"
                className="w-full gap-2 font-semibold border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                🌟 See My Stickers
              </Button>
            )}
            <Button
              data-ocid="listen_choose_results.replay_button"
              onClick={handleRestart}
              className="w-full gap-2 font-semibold"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Button
              data-ocid="listen_choose_results.back_button"
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
              <span className="font-semibold">🎯 Listen &amp; Choose</span>
              <span className="text-muted-foreground">
                {currentIndex + 1} / {shuffled.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <SoundToggle muted={muted} onToggle={toggleMute} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-card border-2 border-border rounded-3xl p-8 text-center shadow-game space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Listen &amp; Choose
                </p>
                <p className="font-body text-lg text-muted-foreground">
                  Which word did you hear?
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  data-ocid="listen_choose.replay_button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakWord(current.word)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-24 h-24 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <Volume2 className="h-10 w-10 text-sky-600" />
                  </div>
                  <span className="text-xs font-semibold text-sky-600">
                    Tap to hear again
                  </span>
                </motion.button>
                <Button
                  data-ocid="listen_choose.slow_button"
                  variant="outline"
                  size="sm"
                  onClick={() => speakWord(current.word, 0.5)}
                  className="text-xs gap-1.5"
                >
                  🐢 Slow
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3">
          {choices.map((word, i) => {
            const isSelected = selected === word;
            const isCorrect = word === current.word;
            let variant: "default" | "outline" = "outline";
            let extraClass = "h-14 text-base font-semibold transition-all";
            if (selected) {
              if (isCorrect)
                extraClass +=
                  " bg-success/20 border-success text-success-foreground border-2";
              else if (isSelected)
                extraClass +=
                  " bg-destructive/20 border-destructive text-destructive border-2";
            }
            return (
              <motion.div
                key={`${currentIndex}-${word}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Button
                  data-ocid={`listen_choose.choice_button.${i + 1}`}
                  variant={variant}
                  className={`w-full ${extraClass}`}
                  onClick={() => handleChoice(word)}
                  disabled={!!selected}
                >
                  {word}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                selected === current.word
                  ? "bg-success/15 border-success"
                  : "bg-destructive/10 border-destructive"
              }`}
            >
              {selected === current.word
                ? "Correct! 🎉"
                : `Incorrect. The word was "${current.word}"`}
            </div>
            <Button
              data-ocid="listen_choose.next_button"
              onClick={handleNext}
              className="w-full font-semibold"
            >
              {currentIndex + 1 >= shuffled.length
                ? "See Results"
                : "Next Word"}
            </Button>
          </motion.div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Score: <span className="font-bold text-primary">{score}</span> /{" "}
          {currentIndex}
        </div>
      </main>
    </div>
  );
}
