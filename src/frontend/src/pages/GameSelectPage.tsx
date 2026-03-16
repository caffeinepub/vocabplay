import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Layers, Mic, Shuffle } from "lucide-react";
import { motion } from "motion/react";

type GameType = "flashcards" | "quiz" | "matching" | "spelling";

interface GameSelectPageProps {
  setId: string;
  setName: string;
  wordCount: number;
  onSelectGame: (game: GameType) => void;
  onBack: () => void;
}

const games = [
  {
    id: "flashcards" as GameType,
    title: "Flashcards",
    description: "Flip cards to learn word definitions at your own pace",
    emoji: "🃏",
    color: "from-cyan-400/25 to-teal-400/25",
    border: "border-cyan-300",
    icon: Layers,
    iconColor: "text-cyan-600",
    bg: "bg-cyan-50",
    ocid: "game_select.flashcard_button",
  },
  {
    id: "quiz" as GameType,
    title: "Multiple Choice",
    description: "Test your knowledge by picking the right definition",
    emoji: "🎯",
    color: "from-green-400/25 to-emerald-400/25",
    border: "border-green-300",
    icon: HelpCircle,
    iconColor: "text-green-600",
    bg: "bg-green-50",
    ocid: "game_select.quiz_button",
  },
  {
    id: "matching" as GameType,
    title: "Matching",
    description: "Match words with their definitions as fast as you can",
    emoji: "🧩",
    color: "from-violet-400/25 to-purple-400/25",
    border: "border-violet-300",
    icon: Shuffle,
    iconColor: "text-violet-600",
    bg: "bg-violet-50",
    ocid: "game_select.matching_button",
  },
  {
    id: "spelling" as GameType,
    title: "Spelling Bee",
    description: "Read the definition and type the correct spelling",
    emoji: "🐝",
    color: "from-orange-400/25 to-amber-400/25",
    border: "border-orange-300",
    icon: Mic,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
    ocid: "game_select.spelling_button",
  },
];

export function GameSelectPage({
  setName,
  wordCount,
  onSelectGame,
  onBack,
}: GameSelectPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            data-ocid="game_select.back_button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">
              {setName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-2">
            Choose a <span className="text-primary">Game</span>
          </h2>
          <p className="text-muted-foreground">
            Pick how you want to study{" "}
            <Badge variant="secondary" className="font-body">
              {setName}
            </Badge>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {games.map((game, i) => {
            const Icon = game.icon;
            const disabled = wordCount < 2;
            return (
              <motion.button
                key={game.id}
                data-ocid={game.ocid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{
                  y: -3,
                  boxShadow: "6px 10px 0px 0px rgba(0,0,0,0.15)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => !disabled && onSelectGame(game.id)}
                disabled={disabled}
                className={`bg-gradient-to-br ${game.color} border-2 ${game.border} rounded-2xl p-6 text-left shadow-game transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${game.bg} rounded-xl shadow-xs`}>
                    <Icon className={`h-6 w-6 ${game.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-lg">
                        {game.title}
                      </span>
                      <span className="text-xl">{game.emoji}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {game.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
