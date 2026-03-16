import { PronounceButton } from "@/components/PronounceButton";
import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playWrong } from "../utils/soundEffects";

interface MultipleChoiceGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  onBack: () => void;
}

function buildOptions(
  entries: VocabEntry[],
  correctIndex: number,
): { text: string; isCorrect: boolean }[] {
  const correct = entries[correctIndex];
  const others = entries.filter((_, i) => i !== correctIndex);
  const wrongs = shuffleArray(others).slice(0, 3);
  return shuffleArray([
    { text: correct.definition, isCorrect: true },
    ...wrongs.map((e) => ({ text: e.definition, isCorrect: false })),
  ]);
}

export function MultipleChoiceGame({
  entries,
  setId,
  setName,
  onBack,
}: MultipleChoiceGameProps) {
  const [shuffled] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState(() => buildOptions(shuffled, 0));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
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
        gameType: "Multiple Choice",
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

  const buildNextOptions = useCallback(
    (idx: number) => buildOptions(shuffled, idx),
    [shuffled],
  );

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    if (options[optIdx].isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }

    setTimeout(() => {
      if (currentIndex + 1 >= shuffled.length) {
        setFinished(true);
      } else {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setOptions(buildNextOptions(nextIdx));
        setSelected(null);
      }
    }, 900);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setOptions(buildNextOptions(0));
    setSelected(null);
    setScore(0);
    setFinished(false);
    setRecorded(false);
  };

  const progress = (currentIndex / shuffled.length) * 100;
  const scorePercent = Math.round((score / shuffled.length) * 100);

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
            Quiz Complete!
          </h2>
          <p className="text-muted-foreground mb-6">{setName}</p>
          <div className="bg-primary/10 rounded-2xl p-6 mb-6">
            <div className="font-display font-bold text-5xl text-primary">
              {scorePercent}%
            </div>
            <div className="text-muted-foreground mt-1">
              {score} / {shuffled.length} correct
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              data-ocid="results.replay_button"
              onClick={handleRestart}
              className="w-full gap-2 font-semibold"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
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

  const current = shuffled[currentIndex];
  const ocidOptions = [
    "quiz.option_button.1",
    "quiz.option_button.2",
    "quiz.option_button.3",
    "quiz.option_button.4",
  ];

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
              <span className="font-semibold">🎯 Multiple Choice</span>
              <span className="text-muted-foreground">
                {currentIndex + 1} / {shuffled.length}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card border-2 border-border rounded-3xl p-8 text-center shadow-game">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                What is the meaning of...
              </p>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-foreground mb-4">
                {current.word}
              </h2>
              <PronounceButton
                word={current.word}
                size="default"
                data-ocid="quiz.pronounce_button"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, i) => {
                let extraClass = "";
                if (selected !== null) {
                  if (opt.isCorrect)
                    extraClass =
                      "border-success bg-success/15 text-success font-semibold";
                  else if (i === selected && !opt.isCorrect)
                    extraClass =
                      "border-destructive bg-destructive/10 text-destructive font-semibold";
                  else extraClass = "opacity-50";
                }

                return (
                  <motion.button
                    key={opt.text}
                    data-ocid={ocidOptions[i]}
                    whileHover={selected === null ? { scale: 1.02 } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                    className={`w-full p-4 rounded-2xl border-2 border-border bg-card text-left text-sm font-body transition-all duration-200 ${extraClass} disabled:cursor-default`}
                  >
                    <span className="font-semibold text-muted-foreground mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt.text}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Score: <span className="font-bold text-primary">{score}</span> /{" "}
          {currentIndex}
        </div>
      </main>
    </div>
  );
}
