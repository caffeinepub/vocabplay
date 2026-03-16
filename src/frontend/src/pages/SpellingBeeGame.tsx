import { PronounceButton } from "@/components/PronounceButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { shuffleArray } from "../utils/parseVocab";

interface SpellingBeeGameProps {
  entries: VocabEntry[];
  setName: string;
  onBack: () => void;
}

export function SpellingBeeGame({
  entries,
  setName,
  onBack,
}: SpellingBeeGameProps) {
  const [shuffled] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "revealed" | null
  >(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = shuffled[currentIndex];
  const progress = (currentIndex / shuffled.length) * 100;

  const handleSubmit = () => {
    if (!input.trim() || feedback) return;
    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex + 1 >= shuffled.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setInput("");
        setFeedback(null);
        inputRef.current?.focus();
      }
    }, 1200);
  };

  const handleReveal = () => {
    setFeedback("revealed");
    setTimeout(() => {
      if (currentIndex + 1 >= shuffled.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setInput("");
        setFeedback(null);
        inputRef.current?.focus();
      }
    }, 1800);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setInput("");
    setFeedback(null);
    setScore(0);
    setFinished(false);
  };

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
            {scorePercent >= 80 ? "🐝" : scorePercent >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            Spelling Bee Done!
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

  let feedbackBg = "";
  let feedbackText = "";
  if (feedback === "correct") {
    feedbackBg = "bg-success/15 border-success";
    feedbackText = "Correct! 🎉";
  }
  if (feedback === "wrong") {
    feedbackBg = "bg-destructive/10 border-destructive";
    feedbackText = `Incorrect. The answer is "${current.word}"`;
  }
  if (feedback === "revealed") {
    feedbackBg = "bg-secondary border-secondary-foreground/20";
    feedbackText = `The word is "${current.word}"`;
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
              <span className="font-semibold">🐝 Spelling Bee</span>
              <span className="text-muted-foreground">
                {currentIndex + 1} / {shuffled.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
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
            <div className="bg-card border-2 border-border rounded-3xl p-8 text-center shadow-game space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Definition
              </p>
              <p className="font-body text-xl md:text-2xl text-foreground leading-relaxed">
                {current.definition}
              </p>
              <div className="pt-2 border-t border-border/50 flex flex-col items-center gap-2">
                <PronounceButton
                  word={current.word}
                  size="default"
                  data-ocid="spelling.pronounce_button"
                  className="gap-2 px-5 py-2 rounded-full font-semibold text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  Tap to hear the word
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              data-ocid="spelling.input"
              placeholder="Type the word..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={!!feedback}
              className={`flex-1 text-lg font-semibold h-12 ${
                feedback === "correct"
                  ? "border-success"
                  : feedback === "wrong"
                    ? "border-destructive"
                    : ""
              }`}
              autoFocus
            />
            <Button
              data-ocid="spelling.submit_button"
              onClick={handleSubmit}
              disabled={!input.trim() || !!feedback}
              className="h-12 px-5 font-semibold"
            >
              Check
            </Button>
          </div>

          {!feedback && (
            <Button
              data-ocid="spelling.reveal_button"
              variant="ghost"
              size="sm"
              onClick={handleReveal}
              className="text-muted-foreground gap-1.5 text-xs"
            >
              <Eye className="h-3.5 w-3.5" /> Reveal answer
            </Button>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${feedbackBg}`}
              >
                {feedbackText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Score: <span className="font-bold text-primary">{score}</span> /{" "}
          {currentIndex}
        </div>
      </main>
    </div>
  );
}
