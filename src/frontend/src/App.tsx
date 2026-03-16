import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { VocabEntry } from "./backend.d";
import { useGetVocabSet } from "./hooks/useQueries";
import { AudioSpellingGame } from "./pages/AudioSpellingGame";
import { FlashcardsGame } from "./pages/FlashcardsGame";
import { GameSelectPage } from "./pages/GameSelectPage";
import { HomePage } from "./pages/HomePage";
import { MatchingGame } from "./pages/MatchingGame";
import { MultipleChoiceGame } from "./pages/MultipleChoiceGame";
import { NameEntryPage } from "./pages/NameEntryPage";
import { SpellingBeeGame } from "./pages/SpellingBeeGame";
import { TeacherDashboard } from "./pages/TeacherDashboard";

type View =
  | { type: "home" }
  | { type: "teacher" }
  | { type: "game-select"; setId: string; setName: string }
  | { type: "flashcards"; setId: string; setName: string }
  | { type: "quiz"; setId: string; setName: string }
  | { type: "matching"; setId: string; setName: string }
  | { type: "spelling"; setId: string; setName: string }
  | { type: "audio-spelling"; setId: string; setName: string };

function GameWrapper({
  view,
  onBack,
}: {
  view: Exclude<
    View,
    { type: "home" } | { type: "teacher" } | { type: "game-select" }
  >;
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

  if (view.type === "flashcards")
    return (
      <FlashcardsGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
      />
    );
  if (view.type === "quiz")
    return (
      <MultipleChoiceGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
      />
    );
  if (view.type === "matching")
    return (
      <MatchingGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
      />
    );
  if (view.type === "spelling")
    return (
      <SpellingBeeGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
      />
    );
  if (view.type === "audio-spelling")
    return (
      <AudioSpellingGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
      />
    );
  return null;
}

function GameSelectWrapper({
  setId,
  setName,
  studentName,
  onSelect,
  onBack,
}: {
  setId: string;
  setName: string;
  studentName?: string;
  onSelect: (game: string) => void;
  onBack: () => void;
}) {
  const { data: set } = useGetVocabSet(setId);
  const entries = set?.entries ?? [];
  const hasDefinitions = entries.some(
    (e) => e.definition && e.definition.trim() !== "",
  );

  return (
    <GameSelectPage
      setId={setId}
      setName={setName}
      studentName={studentName}
      wordCount={entries.length}
      hasDefinitions={hasDefinitions}
      onSelectGame={
        onSelect as (
          g: "flashcards" | "quiz" | "matching" | "spelling" | "audio-spelling",
        ) => void
      }
      onBack={onBack}
    />
  );
}

export default function App() {
  const [studentName, setStudentName] = useState(
    () => sessionStorage.getItem("studentName") ?? "",
  );
  const [view, setView] = useState<View>({ type: "home" });

  const goHome = () => setView({ type: "home" });
  const goGameSelect = (setId: string, setName: string) =>
    setView({ type: "game-select", setId, setName });
  const goGame = (game: string, setId: string, setName: string) =>
    setView({ type: game as View["type"], setId, setName } as View);

  if (view.type === "teacher") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <TeacherDashboard onBack={() => setView({ type: "home" })} />
      </>
    );
  }

  if (!studentName) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <NameEntryPage
          onEnter={(name) => setStudentName(name)}
          onTeacher={() => setView({ type: "teacher" })}
        />
      </>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      {view.type === "home" && (
        <HomePage
          onPlay={(id, name) => goGameSelect(id, name)}
          onTeacher={() => setView({ type: "teacher" })}
        />
      )}
      {view.type === "game-select" && (
        <GameSelectWrapper
          setId={view.setId}
          setName={view.setName}
          studentName={studentName}
          onSelect={(game) => goGame(game, view.setId, view.setName)}
          onBack={goHome}
        />
      )}
      {(view.type === "flashcards" ||
        view.type === "quiz" ||
        view.type === "matching" ||
        view.type === "spelling" ||
        view.type === "audio-spelling") && (
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
