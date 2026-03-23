import { SoundToggle } from "@/components/SoundToggle";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, RotateCcw, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { VocabEntry } from "../backend.d";
import { useAddStudentSticker, useRecordGameResult } from "../hooks/useQueries";
import { useSoundToggle } from "../hooks/useSoundToggle";
import { shuffleArray } from "../utils/parseVocab";
import { playCorrect, playFinish, playWrong } from "../utils/soundEffects";

interface AudioSpellingGameProps {
  entries: VocabEntry[];
  setId: string;
  setName: string;
  onBack: () => void;
  onViewStickers?: () => void;
}

function speakWord(word: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

/**
 * Returns a Set of character indices that are revealed (shown) in the hint.
 * ~40% of letters are shown, spread evenly, always including the last letter.
 */
function getRevealedPositions(word: string): Set<number> {
  const len = word.length;
  const revealed = new Set<number>();
  if (len <= 3) {
    for (let i = 0; i < len; i++) revealed.add(i);
    return revealed;
  }
  // Reveal every 3rd character starting from index 0
  for (let i = 0; i < len; i++) {
    if (i % 3 === 0) revealed.add(i);
  }
  // Always reveal the last letter
  revealed.add(len - 1);
  return revealed;
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

function FillInWord({
  word,
  feedback,
  onComplete,
}: {
  word: string;
  feedback: "correct" | "wrong" | "revealed" | null;
  onComplete: (answer: string) => void;
}) {
  const revealed = getRevealedPositions(word);
  // blankIndices: positions the student must fill in
  const blankIndices = word
    .split("")
    .map((_, i) => i)
    .filter((i) => !revealed.has(i));
  const [values, setValues] = useState<string[]>(() =>
    blankIndices.map(() => ""),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when word changes
  useEffect(() => {
    const rev = getRevealedPositions(word);
    const blanks = word
      .split("")
      .map((_, i) => i)
      .filter((i) => !rev.has(i));
    setValues(blanks.map(() => ""));
    setTimeout(() => inputRefs.current[0]?.focus(), 80);
  }, [word]);

  const handleChange = (blankPos: number, char: string) => {
    // Allow only one character per box
    const c = char.slice(-1);
    const next = values.map((v, i) => (i === blankPos ? c : v));
    setValues(next);
    // Auto-advance to next blank
    if (c && blankPos + 1 < blankIndices.length) {
      inputRefs.current[blankPos + 1]?.focus();
    }
  };

  const handleKeyDown = (
    blankPos: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !values[blankPos] && blankPos > 0) {
      // Go back to previous blank on backspace if current is empty
      inputRefs.current[blankPos - 1]?.focus();
    }
    if (e.key === "Enter") {
      // Submit
      const full = buildAnswer();
      if (full.length === word.length) onComplete(full);
    }
  };

  const buildAnswer = () => {
    let blankCount = 0;
    return word
      .split("")
      .map((c, i) => {
        if (revealed.has(i)) return c;
        const v = values[blankCount++] ?? "";
        return v;
      })
      .join("");
  };

  const allFilled = values.every((v) => v !== "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-1.5">
        {word.split("").map((char, i) => {
          if (revealed.has(i)) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: character positions in a fixed word string are stable
                key={`char-${i}`}
                className="w-9 h-10 flex items-end justify-center border-b-2 border-primary/40 pb-1"
              >
                <span className="text-xl font-mono font-bold text-foreground">
                  {char}
                </span>
              </div>
            );
          }
          const blankPos = blankIndices.indexOf(i);
          const isCorrectFeedback =
            feedback === "correct" || feedback === "revealed";
          const isWrongFeedback = feedback === "wrong";
          return (
            <input
              // biome-ignore lint/suspicious/noArrayIndexKey: character positions in a fixed word string are stable
              key={`char-${i}`}
              ref={(el) => {
                inputRefs.current[blankPos] = el;
              }}
              type="text"
              maxLength={2}
              value={
                isCorrectFeedback || isWrongFeedback
                  ? char
                  : (values[blankPos] ?? "")
              }
              onChange={(e) =>
                !feedback && handleChange(blankPos, e.target.value)
              }
              onKeyDown={(e) => !feedback && handleKeyDown(blankPos, e)}
              disabled={!!feedback}
              className={[
                "w-9 h-10 text-center text-xl font-mono font-bold border-b-2 border-dashed bg-transparent outline-none",
                "transition-colors rounded-none px-0",
                !feedback
                  ? "border-pink-400 focus:border-pink-600 text-foreground"
                  : isCorrectFeedback
                    ? "border-green-500 text-green-700"
                    : "border-red-400 text-red-600",
              ].join(" ")}
            />
          );
        })}
      </div>
      {!feedback && (
        <div className="flex justify-center">
          <Button
            data-ocid="audio_spelling.submit_button"
            onClick={() => onComplete(buildAnswer())}
            disabled={!allFilled}
            className="px-8 font-semibold"
          >
            Check
          </Button>
        </div>
      )}
    </div>
  );
}

export function AudioSpellingGame({
  entries,
  setId,
  setName,
  onBack,
  onViewStickers,
}: AudioSpellingGameProps) {
  const [shuffled] = useState(() => shuffleArray(entries));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "revealed" | null
  >(null);
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
        gameType: "Listen & Fill",
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

  const handleComplete = (answer: string) => {
    if (feedback) return;
    const isCorrect = answer.toLowerCase() === current.word.toLowerCase();
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      if (!muted) playCorrect();
    } else {
      if (!muted) playWrong();
    }
    setTimeout(() => {
      advance();
    }, 1400);
  };

  const handleReveal = () => {
    setFeedback("revealed");
    setTimeout(() => {
      advance();
    }, 1800);
  };

  const advance = () => {
    if (currentIndex + 1 >= shuffled.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFeedback(null);
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
            {scorePercent >= 80 ? "🔊" : scorePercent >= 50 ? "👏" : "💪"}
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-1">
            Listen &amp; Fill Done!
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
                data-ocid="audio_results.view_stickers_button"
                onClick={onViewStickers}
                variant="outline"
                className="w-full gap-2 font-semibold border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                🌟 See My Stickers
              </Button>
            )}
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

  let feedbackText = "";
  let feedbackClass = "";
  if (feedback === "correct") {
    feedbackText = "Correct! 🎉";
    feedbackClass = "bg-success/15 border-success text-success-foreground";
  } else if (feedback === "wrong") {
    feedbackText = `Not quite -- the word is "${current.word}"`;
    feedbackClass = "bg-destructive/10 border-destructive";
  } else if (feedback === "revealed") {
    feedbackText = `The word is "${current.word}"`;
    feedbackClass = "bg-secondary border-secondary-foreground/20";
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
              <span className="font-semibold">🔊 Listen &amp; Fill</span>
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
                  Listen &amp; Fill
                </p>
                <p className="text-sm text-muted-foreground">
                  Tap to hear, then fill in the missing letters
                </p>
              </div>
              <motion.button
                data-ocid="audio_spelling.replay_button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speakWord(current.word)}
                className="flex flex-col items-center gap-2 group mx-auto"
              >
                <div className="w-20 h-20 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Volume2 className="h-9 w-9 text-pink-600" />
                </div>
                <span className="text-xs font-semibold text-pink-600">
                  Tap to hear again
                </span>
              </motion.button>

              <FillInWord
                key={`fill-${currentIndex}`}
                word={current.word}
                feedback={feedback}
                onComplete={handleComplete}
              />

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${feedbackClass}`}
                  >
                    {feedbackText}
                  </motion.div>
                )}
              </AnimatePresence>

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
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="text-center text-sm text-muted-foreground">
          Score: <span className="font-bold text-primary">{score}</span> /{" "}
          {currentIndex}
        </div>
      </main>
    </div>
  );
}
