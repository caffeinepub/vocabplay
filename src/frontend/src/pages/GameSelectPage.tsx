import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare, Mic, Volume2 } from "lucide-react";
import { motion } from "motion/react";

type GameType = "spelling" | "audio-spelling" | "listen-choose";

interface GameSelectPageProps {
  setId: string;
  setName: string;
  wordCount: number;
  hasDefinitions: boolean;
  studentName?: string;
  onSelectGame: (game: GameType) => void;
  onBack: () => void;
}

const games = [
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
  {
    id: "audio-spelling" as GameType,
    title: "Listen & Fill",
    description: "Listen to the word and type the correct spelling",
    emoji: "🔊",
    color: "from-pink-400/25 to-rose-400/25",
    border: "border-pink-300",
    icon: Volume2,
    iconColor: "text-pink-600",
    bg: "bg-pink-50",
    ocid: "game_select.audio_spelling_button",
  },
  {
    id: "listen-choose" as GameType,
    title: "Listen & Choose",
    description: "Listen to the audio and pick the right word from 4 options",
    emoji: "🎯",
    color: "from-sky-400/25 to-blue-400/25",
    border: "border-sky-300",
    icon: CheckSquare,
    iconColor: "text-sky-600",
    bg: "bg-sky-50",
    ocid: "game_select.listen_choose_button",
  },
];

export function GameSelectPage({
  setName,
  wordCount,
  studentName,
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
          {studentName ? (
            <p className="text-muted-foreground font-body">
              Good luck,{" "}
              <span className="font-semibold text-foreground">
                {studentName}
              </span>
              ! 🎉
            </p>
          ) : (
            <p className="text-muted-foreground">
              Pick how you want to study{" "}
              <Badge variant="secondary" className="font-body">
                {setName}
              </Badge>
            </p>
          )}
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
