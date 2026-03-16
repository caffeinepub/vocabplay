import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useState } from "react";

interface NameEntryPageProps {
  onEnter: (name: string) => void;
  onTeacher: () => void;
}

export function NameEntryPage({ onEnter, onTeacher }: NameEntryPageProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    sessionStorage.setItem("studentName", trimmed);
    onEnter(trimmed);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="text-5xl mb-3">📚</div>
          <h1 className="font-display font-extrabold text-4xl text-foreground tracking-tight">
            Vocab<span className="text-primary">Play</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">
            Fun vocabulary games for students
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card border-2 border-border rounded-3xl p-8 shadow-game"
        >
          <h2 className="font-display font-bold text-2xl text-card-foreground mb-1">
            What's your name? 👋
          </h2>
          <p className="text-muted-foreground text-sm font-body mb-6">
            Enter your name to start playing
          </p>

          <div className="space-y-4">
            <Input
              data-ocid="name_entry.input"
              autoFocus
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-12 text-base rounded-xl border-2 font-body"
            />
            <Button
              data-ocid="name_entry.submit_button"
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full h-12 text-base font-display font-bold rounded-xl"
              size="lg"
            >
              Let's Play! 🎮
            </Button>
          </div>
        </motion.div>

        {/* Teacher link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center mt-5"
        >
          <button
            type="button"
            data-ocid="name_entry.teacher_link"
            onClick={onTeacher}
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-body underline underline-offset-2"
          >
            Are you a teacher? Click here
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
