import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { GameResult } from "../backend.d";

interface ProgressPageProps {
  results: GameResult[];
  studentName: string;
  onBack: () => void;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(pct: number): string {
  if (pct >= 90) return "text-emerald-600 bg-emerald-50";
  if (pct >= 70) return "text-yellow-600 bg-yellow-50";
  if (pct >= 50) return "text-orange-500 bg-orange-50";
  return "text-rose-500 bg-rose-50";
}

const gameEmojis: Record<string, string> = {
  "Spelling Bee": "🐝",
  "Listen & Fill": "🔊",
  "Listen & Choose": "🎯",
};

export function ProgressPage({
  results,
  studentName,
  onBack,
}: ProgressPageProps) {
  const sorted = [...results].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            data-ocid="progress.back_button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">📊 My Progress</h1>
            <p className="text-xs text-muted-foreground">{studentName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {sorted.length === 0 ? (
          <motion.div
            data-ocid="progress.empty_state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-white/60"
          >
            <div className="text-7xl mb-4">🌱</div>
            <h2 className="font-display font-bold text-2xl mb-2">
              No games yet!
            </h2>
            <p className="text-muted-foreground font-body">
              Start playing to track your progress! 🚀
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sorted.map((result, i) => {
              const pct = Math.round(
                (Number(result.score) / Number(result.total)) * 100,
              );
              const emoji = gameEmojis[result.gameType] ?? "🎮";
              return (
                <motion.div
                  key={`${result.setName}-${result.gameType}-${String(result.timestamp)}`}
                  data-ocid={`progress.item.${i + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="text-3xl">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-base leading-tight truncate">
                      {result.setName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {result.gameType} · {formatDate(result.timestamp)}
                    </p>
                  </div>
                  <div
                    className={`font-display font-extrabold text-xl rounded-xl px-3 py-1 ${scoreColor(pct)}`}
                  >
                    {pct}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
