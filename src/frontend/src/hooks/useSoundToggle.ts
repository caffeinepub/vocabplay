import { useState } from "react";

const STORAGE_KEY = "vocabplay_muted";

export function useSoundToggle(): [boolean, () => void] {
  const [muted, setMuted] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return [muted, toggleMute];
}
