import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface StickerCollectionPageProps {
  stickers: string[];
  onBack: () => void;
}

const stickerBgs = [
  "bg-yellow-100 border-yellow-300",
  "bg-pink-100 border-pink-300",
  "bg-orange-100 border-orange-300",
  "bg-purple-100 border-purple-300",
  "bg-green-100 border-green-300",
  "bg-sky-100 border-sky-300",
];

export function StickerCollectionPage({
  stickers,
  onBack,
}: StickerCollectionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            data-ocid="stickers.back_button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl">🌟 My Stickers</h1>
          {stickers.length > 0 && (
            <span className="ml-auto text-sm text-muted-foreground font-semibold bg-muted rounded-full px-3 py-1">
              {stickers.length} {stickers.length === 1 ? "sticker" : "stickers"}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {stickers.length === 0 ? (
          <motion.div
            data-ocid="stickers.empty_state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-white/60"
          >
            <div className="text-7xl mb-4">🎁</div>
            <h2 className="font-display font-bold text-2xl mb-2">
              No stickers yet!
            </h2>
            <p className="text-muted-foreground font-body">
              Play games to earn stickers! 🎮
            </p>
          </motion.div>
        ) : (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground mb-6 font-body"
            >
              Look at all your amazing stickers! Keep playing to earn more! 🎊
            </motion.p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {stickers.map((sticker, i) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: stickers are identical emojis, order matters
                  key={`${sticker}-${i}`}
                  data-ocid={`stickers.item.${i + 1}`}
                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className={`aspect-square flex items-center justify-center rounded-2xl border-2 text-4xl shadow-sm cursor-default select-none ${
                    stickerBgs[i % stickerBgs.length]
                  }`}
                >
                  {sticker}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
