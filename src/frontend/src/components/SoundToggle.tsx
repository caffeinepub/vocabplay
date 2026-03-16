import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-xl"
      data-ocid="game.sound_toggle"
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      title={muted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
