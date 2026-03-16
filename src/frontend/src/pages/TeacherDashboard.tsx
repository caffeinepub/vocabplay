import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { VocabModal } from "../components/VocabModal";
import {
  useClearGameResults,
  useDeleteVocabSet,
  useGetVocabSet,
  useListGameResults,
  useListVocabSets,
} from "../hooks/useQueries";

interface TeacherDashboardProps {
  onBack: () => void;
}

function SetCard({
  id,
  name,
  index,
  onEdit,
  onDelete,
}: {
  id: string;
  name: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
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
      data-ocid={`teacher.vocab.set.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-gradient-to-br ${colorClass} border-2 rounded-2xl p-5 shadow-game hover:shadow-game-hover hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-white/70 rounded-xl shadow-xs shrink-0">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base leading-tight truncate">
              {name}
            </h3>
            <Badge variant="secondary" className="text-xs mt-0.5 font-body">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            data-ocid={`teacher.vocab.set.edit_button.${ocidIndex}`}
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 bg-white/60"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            data-ocid={`teacher.vocab.set.delete_button.${ocidIndex}`}
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 bg-white/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (value === "teacher123") {
      onSuccess();
    } else {
      setError(true);
      setValue("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-card border-2 border-border rounded-3xl p-8 shadow-game text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-primary rounded-2xl shadow-xs">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h2 className="font-display font-extrabold text-2xl mb-1">
          Teacher Access
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Enter your passcode to view the dashboard
        </p>
        <div className="space-y-3">
          <Input
            data-ocid="teacher.passcode_input"
            type="password"
            placeholder="Passcode"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`text-center text-lg h-12 font-semibold ${
              error ? "border-destructive" : ""
            }`}
            autoFocus
          />
          {error && (
            <motion.p
              data-ocid="teacher.passcode.error_state"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-sm font-semibold"
            >
              Incorrect passcode. Please try again.
            </motion.p>
          )}
          <Button
            data-ocid="teacher.passcode_submit_button"
            onClick={handleSubmit}
            className="w-full font-semibold h-11"
          >
            Enter Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: results, isLoading: resultsLoading } = useListGameResults();
  const { data: sets, isLoading: setsLoading } = useListVocabSets();
  const deleteMutation = useDeleteVocabSet();
  const clearMutation = useClearGameResults();

  if (!authenticated) {
    return <PasscodeGate onSuccess={() => setAuthenticated(true)} />;
  }

  const handleClearResults = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all student results? This cannot be undone.",
      )
    ) {
      clearMutation.mutate();
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp / 1_000_000n));
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const gameEmoji: Record<string, string> = {
    Flashcards: "🃏",
    "Multiple Choice": "🎯",
    Matching: "🧩",
    "Spelling Bee": "🐝",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            data-ocid="teacher.back_button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="p-2 bg-primary rounded-xl shadow-xs">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">
                Teacher Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">VocabPlay</p>
            </div>
          </div>
          <Button
            data-ocid="teacher.back_to_app_button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-1.5 font-semibold text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to App
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="progress">
          <TabsList className="mb-6">
            <TabsTrigger
              data-ocid="teacher.progress_tab"
              value="progress"
              className="gap-2"
            >
              <Trophy className="h-4 w-4" /> Student Progress
            </TabsTrigger>
            <TabsTrigger
              data-ocid="teacher.vocab_tab"
              value="vocab"
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" /> Vocabulary Sets
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Student Progress */}
          <TabsContent value="progress">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                Student Results
              </h2>
              {results && results.length > 0 && (
                <Button
                  data-ocid="teacher.clear_button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearResults}
                  disabled={clearMutation.isPending}
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear All Results
                </Button>
              )}
            </div>

            {resultsLoading ? (
              <div
                data-ocid="teacher.results.loading_state"
                className="space-y-2"
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div
                data-ocid="teacher.results_table"
                className="rounded-2xl border-2 border-border overflow-hidden"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Student</TableHead>
                      <TableHead className="font-semibold">Game</TableHead>
                      <TableHead className="font-semibold">Set</TableHead>
                      <TableHead className="font-semibold text-right">
                        Score
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r, idx) => (
                      <TableRow
                        key={`${r.studentName}-${String(r.timestamp)}-${idx}`}
                        data-ocid={`teacher.results.row.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-semibold">
                          {r.studentName}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            <span>{gameEmoji[r.gameType] ?? "🎮"}</span>
                            <span className="text-sm">{r.gameType}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {r.setName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              Number(r.score) / Number(r.total) >= 0.8
                                ? "default"
                                : Number(r.score) / Number(r.total) >= 0.5
                                  ? "secondary"
                                  : "outline"
                            }
                            className="font-mono font-bold"
                          >
                            {Number(r.score)} / {Number(r.total)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(r.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <motion.div
                data-ocid="teacher.results.empty_state"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-muted/20"
              >
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-display font-bold text-xl mb-2">
                  No results yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Student scores will appear here once they play a game.
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Tab 2: Vocabulary Sets */}
          <TabsContent value="vocab">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                Vocabulary Sets
              </h2>
              <Button
                data-ocid="teacher.vocab.add_button"
                onClick={() => {
                  setEditId(null);
                  setModalOpen(true);
                }}
                className="gap-2 font-semibold"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Add New Set
              </Button>
            </div>

            {setsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : sets && sets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.map(([id, name], idx) => (
                  <SetCard
                    key={id}
                    id={id}
                    name={name}
                    index={idx}
                    onEdit={() => {
                      setEditId(id);
                      setModalOpen(true);
                    }}
                    onDelete={() => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                data-ocid="teacher.vocab.empty_state"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-muted/20"
              >
                <div className="text-5xl mb-4">📚</div>
                <h3 className="font-display font-bold text-xl mb-2">
                  No vocabulary sets yet
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Create a set to get students playing!
                </p>
                <Button
                  data-ocid="teacher.vocab.add_button"
                  onClick={() => {
                    setEditId(null);
                    setModalOpen(true);
                  }}
                  className="gap-2 font-semibold"
                >
                  <Plus className="h-4 w-4" /> Create First Set
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <VocabModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editId={editId}
      />

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
