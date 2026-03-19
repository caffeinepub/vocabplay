import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, Play, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useGetVocabSet, useListVocabSets } from "../hooks/useQueries";

interface HomePageProps {
  onPlay: (id: string, name: string) => void;
  onTeacher: () => void;
  onViewStickers?: () => void;
  onViewProgress?: () => void;
}

function SetCard({
  id,
  name,
  index,
  onPlay,
}: {
  id: string;
  name: string;
  index: number;
  onPlay: () => void;
}) {
  const { data: set } = useGetVocabSet(id);
  const wordCount = set?.entries.length ?? 0;

  const colors = [
    "from-orange-400/20 to-red-400/20 border-orange-300",
    "from-teal-400/20 to-cyan-400/20 border-teal-300",
    "from-violet-400/20 to-purple-400/20 border-violet-300",
    "from-yellow-400/20 to-amber-400/20 border-yellow-300",
    "from-green-400/20 to-emerald-400/20 border-green-300",
  ];
  const colorClass = colors[index % colors.length];
  const ocidIndex = index + 1;

  return (
    <motion.div
      data-ocid={`home.set.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.07 }}
      className={`bg-gradient-to-br ${colorClass} border-2 rounded-2xl p-5 shadow-game hover:shadow-game-hover hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 bg-white/70 rounded-xl shadow-xs">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg leading-tight">
            {name}
          </h3>
          {set ? (
            <Badge variant="secondary" className="text-xs mt-0.5 font-body">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </Badge>
          ) : (
            <Skeleton className="h-5 w-16 mt-1" />
          )}
        </div>
      </div>

      <Button
        data-ocid={`home.set.play_button.${ocidIndex}`}
        onClick={onPlay}
        disabled={wordCount < 2}
        className="w-full font-semibold gap-1.5 text-sm"
        size="sm"
      >
        <Play className="h-3.5 w-3.5" fill="currentColor" />
        Play Games
      </Button>
    </motion.div>
  );
}

export function HomePage({
  onPlay,
  onTeacher,
  onViewStickers,
  onViewProgress,
}: HomePageProps) {
  const { data: sets, isLoading } = useListVocabSets();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary rounded-xl shadow-xs">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              Listen <span className="text-primary">&amp; Spell</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onViewStickers && (
              <Button
                data-ocid="home.stickers_button"
                variant="ghost"
                size="sm"
                onClick={onViewStickers}
                className="gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                🌟 Stickers
              </Button>
            )}
            {onViewProgress && (
              <Button
                data-ocid="home.progress_button"
                variant="ghost"
                size="sm"
                onClick={onViewProgress}
                className="gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                📊 Progress
              </Button>
            )}
            <Button
              data-ocid="home.teacher_button"
              variant="ghost"
              size="sm"
              onClick={onTeacher}
              className="gap-1.5 text-sm text-muted-foreground hover:text-foreground font-semibold"
            >
              <GraduationCap className="h-4 w-4" /> Teacher
            </Button>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/vocab-hero.dim_800x300.png"
          alt="Listen and Spell"
          className="w-full h-40 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent flex items-center px-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display font-extrabold text-3xl md:text-4xl"
            >
              Listen, Spell, <span className="text-primary">Win!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1 text-sm md:text-base"
            >
              Choose a word set and start practising
            </motion.p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display font-bold text-xl">Vocabulary Sets</h2>
          {sets && sets.length > 0 && (
            <Badge variant="outline" className="font-body ml-auto">
              {sets.length} {sets.length === 1 ? "set" : "sets"}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : sets && sets.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sets.map(([id, name], idx) => (
                <SetCard
                  key={id}
                  id={id}
                  name={name}
                  index={idx}
                  onPlay={() => onPlay(id, name)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            data-ocid="home.empty_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-muted/30"
          >
            <div className="text-6xl mb-4">🔊</div>
            <h3 className="font-display font-bold text-xl mb-2">
              No vocabulary sets yet
            </h3>
            <p className="text-muted-foreground">
              Ask your teacher to add a vocabulary set to get started!
            </p>
          </motion.div>
        )}
      </main>

      <footer className="mt-16 py-6 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
