import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { GameResult, VocabEntry } from "./backend.d";
import {
  useGetStudentGameResults,
  useGetStudentStickers,
  useGetVocabSet,
} from "./hooks/useQueries";
import { AccountPage } from "./pages/AccountPage";
import { AudioSpellingGame } from "./pages/AudioSpellingGame";
import { GameSelectPage } from "./pages/GameSelectPage";
import { HomePage } from "./pages/HomePage";
import { ListenChooseGame } from "./pages/ListenChooseGame";
import { ProgressPage } from "./pages/ProgressPage";
import { SpellingBeeGame } from "./pages/SpellingBeeGame";
import { StickerCollectionPage } from "./pages/StickerCollectionPage";
import { TeacherDashboard } from "./pages/TeacherDashboard";

type View =
  | { type: "home" }
  | { type: "teacher" }
  | { type: "game-select"; setId: string; setName: string }
  | { type: "spelling"; setId: string; setName: string }
  | { type: "audio-spelling"; setId: string; setName: string }
  | { type: "listen-choose"; setId: string; setName: string }
  | { type: "stickers" }
  | { type: "progress" };

function GameWrapper({
  view,
  onBack,
  onViewStickers,
}: {
  view: Exclude<
    View,
    | { type: "home" }
    | { type: "teacher" }
    | { type: "game-select" }
    | { type: "stickers" }
    | { type: "progress" }
  >;
  onBack: () => void;
  onViewStickers: () => void;
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

  if (view.type === "spelling")
    return (
      <SpellingBeeGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
        onViewStickers={onViewStickers}
      />
    );
  if (view.type === "audio-spelling")
    return (
      <AudioSpellingGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
        onViewStickers={onViewStickers}
      />
    );
  if (view.type === "listen-choose")
    return (
      <ListenChooseGame
        entries={entries}
        setId={view.setId}
        setName={view.setName}
        onBack={onBack}
        onViewStickers={onViewStickers}
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
        onSelect as (g: "spelling" | "audio-spelling" | "listen-choose") => void
      }
      onBack={onBack}
    />
  );
}

function StudentApp({
  studentName,
  studentPassword,
}: {
  studentName: string;
  studentPassword: string;
}) {
  const [view, setView] = useState<View>({ type: "home" });

  const { data: stickers = [] } = useGetStudentStickers(
    studentName,
    studentPassword,
  );
  const { data: gameResults = [] } = useGetStudentGameResults(
    studentName,
    studentPassword,
  );

  const goHome = () => setView({ type: "home" });
  const goGameSelect = (setId: string, setName: string) =>
    setView({ type: "game-select", setId, setName });
  const goGame = (game: string, setId: string, setName: string) =>
    setView({ type: game as View["type"], setId, setName } as View);
  const goStickers = () => setView({ type: "stickers" });
  const goProgress = () => setView({ type: "progress" });

  if (view.type === "stickers") {
    return (
      <StickerCollectionPage stickers={stickers as string[]} onBack={goHome} />
    );
  }

  if (view.type === "progress") {
    return (
      <ProgressPage
        results={gameResults as GameResult[]}
        studentName={studentName}
        onBack={goHome}
      />
    );
  }

  if (view.type === "home") {
    return (
      <HomePage
        onPlay={(id, name) => goGameSelect(id, name)}
        onTeacher={() => setView({ type: "teacher" })}
        onViewStickers={goStickers}
        onViewProgress={goProgress}
      />
    );
  }

  if (view.type === "teacher") {
    return <TeacherDashboard onBack={goHome} />;
  }

  if (view.type === "game-select") {
    return (
      <GameSelectWrapper
        setId={view.setId}
        setName={view.setName}
        studentName={studentName}
        onSelect={(game) => goGame(game, view.setId, view.setName)}
        onBack={goHome}
      />
    );
  }

  if (
    view.type === "spelling" ||
    view.type === "audio-spelling" ||
    view.type === "listen-choose"
  ) {
    return (
      <GameWrapper
        view={view}
        onBack={() =>
          setView({
            type: "game-select",
            setId: view.setId,
            setName: view.setName,
          })
        }
        onViewStickers={goStickers}
      />
    );
  }

  return null;
}

export default function App() {
  const [studentName, setStudentName] = useState(
    () => sessionStorage.getItem("studentName") ?? "",
  );
  const [studentPassword, setStudentPassword] = useState(
    () => sessionStorage.getItem("studentPassword") ?? "",
  );
  const [showTeacher, setShowTeacher] = useState(false);

  if (showTeacher) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <TeacherDashboard onBack={() => setShowTeacher(false)} />
      </>
    );
  }

  if (!studentName || !studentPassword) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <AccountPage
          onEnter={(name, password) => {
            setStudentName(name);
            setStudentPassword(password);
          }}
          onTeacher={() => setShowTeacher(true)}
        />
      </>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <StudentApp studentName={studentName} studentPassword={studentPassword} />
    </>
  );
}
