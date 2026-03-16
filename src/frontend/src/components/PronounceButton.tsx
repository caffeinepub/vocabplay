import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useState } from "react";

interface PronounceButtonProps {
  word: string;
  size?: "sm" | "default";
  className?: string;
  "data-ocid"?: string;
}

export function PronounceButton({
  word,
  size = "sm",
  className = "",
  "data-ocid": dataOcid,
}: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "sm" ? "icon" : "default"}
      data-ocid={dataOcid}
      onClick={speak}
      aria-label={`Pronounce ${word}`}
      className={`rounded-full transition-colors ${
        speaking
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      } ${className}`}
    >
      <Volume2 className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </Button>
  );
}
