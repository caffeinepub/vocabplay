import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { VocabEntry } from "./backend.d";
import { useGetVocabSet } from "./hooks/useQueries";
import { FlashcardsGame } from "./pages/FlashcardsGame";
import { GameSelectPage } from "./pages/GameSelectPage";
import { HomePage } from "./pages/HomePage";
import { MatchingGame } from "./pages/MatchingGame";
import { MultipleChoiceGame } from "./pages/MultipleChoiceGame";
import { SpellingBeeGame } from "./pages/SpellingBeeGame";

type View =
  | { type: "home" }
  | { type: "game-select"; setId: string; setName: string }
  | { type: "flashcards"; setId: string; setName: string }
  | { type: "quiz"; setId: string; setName: string }
  | { type: "matching"; setId: string; setName: string }
  | { type: "spelling"; setId: string; setName: string };

function GameWrapper({
  view,
  onBack,
}: {
  view: Exclude<View, { type: "home" } | { type: "game-select" }>;
  onBack: () => void;
}) {
  const { data: set, isLoading } = useGetVocabSet(view.setId);
  const entries: VocabEntry[] = set?.entries ?? [];

  if (isLoading || entries.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-muted-foreground">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (view.type === "flashcards") {
    return (
      <FlashcardsGame
        entries={entries}
        setName={view.setName}
        onBack={onBack}
      />
    );
  }
  if (view.type === "quiz") {
    return (
      <MultipleChoiceGame
        entries={entries}
        setName={view.setName}
        onBack={onBack}
      />
    );
  }
  if (view.type === "matching") {
    return (
      <MatchingGame entries={entries} setName={view.setName} onBack={onBack} />
    );
  }
  if (view.type === "spelling") {
    return (
      <SpellingBeeGame
        entries={entries}
        setName={view.setName}
        onBack={onBack}
      />
    );
  }
  return null;
}

function GameSelectWrapper({
  setId,
  setName,
  onSelect,
  onBack,
}: {
  setId: string;
  setName: string;
  onSelect: (game: string) => void;
  onBack: () => void;
}) {
  const { data: set } = useGetVocabSet(setId);
  return (
    <GameSelectPage
      setId={setId}
      setName={setName}
      wordCount={set?.entries.length ?? 0}
      onSelectGame={
        onSelect as (g: "flashcards" | "quiz" | "matching" | "spelling") => void
      }
      onBack={onBack}
    />
  );
}

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });

  const goHome = () => setView({ type: "home" });

  const goGameSelect = (setId: string, setName: string) =>
    setView({ type: "game-select", setId, setName });

  const goGame = (game: string, setId: string, setName: string) =>
    setView({ type: game as View["type"], setId, setName } as View);

  return (
    <>
      <Toaster richColors position="top-right" />
      {view.type === "home" && (
        <HomePage onPlay={(id, name) => goGameSelect(id, name)} />
      )}
      {view.type === "game-select" && (
        <GameSelectWrapper
          setId={view.setId}
          setName={view.setName}
          onSelect={(game) => goGame(game, view.setId, view.setName)}
          onBack={goHome}
        />
      )}
      {(view.type === "flashcards" ||
        view.type === "quiz" ||
        view.type === "matching" ||
        view.type === "spelling") && (
        <GameWrapper
          view={view}
          onBack={() =>
            setView({
              type: "game-select",
              setId: view.setId,
              setName: view.setName,
            })
          }
        />
      )}
    </>
  );
}
