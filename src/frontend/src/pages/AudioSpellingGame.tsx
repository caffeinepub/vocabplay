import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, RotateCcw, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playWrong } from "../utils/soundEffects";

interface AudioSpellingGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  onBack: () => void;
}

function speakWord(word: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function AudioSpellingGame({
  entries,
  setId,
  setName,
  onBack,
}: AudioSpellingGameProps) {
  const [shuffled] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "revealed" | null
  >(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [muted, toggleMute] = useSoundToggle();
  const [recorded, setRecorded] = useState(false);
  const recordMutation = useRecordGameResult();

  const current = shuffled[currentIndex];
  const progress = (currentIndex / shuffled.length) * 100;

  // Auto-play word audio when the word changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      speakWord(current.word);
    }, 300);
    return () => clearTimeout(timeout);
  }, [current.word]);

  useEffect(() => {
    if (finished && !recorded) {
      const studentName = sessionStorage.getItem("studentName") ?? "Unknown";
      recordMutation.mutate({
        studentName,
        setId,
        setName,
        gameType: "Audio Spelling",
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

  const handleSubmit = () => {
    if (!input.trim() || feedback) return;
    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      if (!muted) playCorrect();
    } else {
      if (!muted) playWrong();
    }

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
    setRecorded(false);
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
            {scorePercent >= 80 ? "🔊" : scorePercent >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            Audio Spelling Done!
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
              data-ocid="audio_spelling_results.replay_button"
              onClick={handleRestart}
              className="w-full gap-2 font-semibold"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Button
              data-ocid="audio_spelling_results.back_button"
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
              <span className="font-semibold">🔊 Audio Spelling</span>
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
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Audio Spelling
                </p>
                <p className="font-body text-lg text-muted-foreground">
                  Listen and spell the word
                </p>
              </div>

              <motion.button
                data-ocid="audio_spelling.replay_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speakWord(current.word)}
                className="mx-auto flex flex-col items-center gap-3 group"
              >
                <div className="w-24 h-24 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Volume2 className="h-10 w-10 text-pink-600" />
                </div>
                <span className="text-sm font-semibold text-pink-600">
                  🔁 Replay Word
                </span>
              </motion.button>

              <p className="text-xs text-muted-foreground">
                Word plays automatically — tap to hear again
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              data-ocid="audio_spelling.input"
              placeholder="Type the word you heard..."
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
              data-ocid="audio_spelling.submit_button"
              onClick={handleSubmit}
              disabled={!input.trim() || !!feedback}
              className="h-12 px-5 font-semibold"
            >
              Check
            </Button>
          </div>

          {!feedback && (
            <Button
              data-ocid="audio_spelling.reveal_button"
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
