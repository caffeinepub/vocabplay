import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { VocabEntry } from "../backend.d";
import {
  useCreateVocabSet,
  useGetVocabSet,
  useUpdateVocabSet,
} from "../hooks/useQueries";
import { generateId, parseVocabList } from "../utils/parseVocab";

interface VocabModalProps {
  open: boolean;
  onClose: () => void;
  editId?: string | null;
}

export function VocabModal({ open, onClose, editId }: VocabModalProps) {
  const [name, setName] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<VocabEntry[]>([]);

  const { data: existingSet } = useGetVocabSet(editId ?? null);
  const createMutation = useCreateVocabSet();
  const updateMutation = useUpdateVocabSet();

  const isEditing = !!editId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open && existingSet && isEditing) {
      setName(existingSet.name);
      const text = existingSet.entries
        .map((e) => `${e.word} - ${e.definition}`)
        .join("\n");
      setRawText(text);
      setParsed(existingSet.entries);
    } else if (open && !isEditing) {
      setName("");
      setRawText("");
      setParsed([]);
    }
  }, [open, existingSet, isEditing]);

  useEffect(() => {
    setParsed(parseVocabList(rawText));
  }, [rawText]);

  const handleSave = async () => {
    if (!name.trim() || parsed.length === 0) return;
    try {
      if (isEditing && editId) {
        await updateMutation.mutateAsync({ id: editId, entries: parsed });
      } else {
        await createMutation.mutateAsync({
          id: generateId(),
          name: name.trim(),
          entries: parsed,
        });
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="vocab_modal.dialog"
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit Vocabulary Set" : "New Vocabulary Set"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="set-name" className="font-semibold">
              Set Name
            </Label>
            <Input
              id="set-name"
              data-ocid="vocab_modal.input"
              placeholder="e.g. Unit 3 Vocabulary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vocab-text" className="font-semibold">
              Paste Vocabulary List
            </Label>
            <p className="text-sm text-muted-foreground">
              One per line. Supported formats:{" "}
              <code className="bg-muted px-1 rounded">word - definition</code>,{" "}
              <code className="bg-muted px-1 rounded">word: definition</code>,{" "}
              <code className="bg-muted px-1 rounded">word = definition</code>
            </p>
            <Textarea
              id="vocab-text"
              data-ocid="vocab_modal.textarea"
              placeholder="abandon - to leave behind&#10;benevolent: kind and generous&#10;tenacious = refusing to give up"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              className="font-mono text-sm resize-none"
            />
          </div>

          {parsed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Preview</span>
                <Badge variant="secondary" className="font-body">
                  {parsed.length} words
                </Badge>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border bg-muted/40 divide-y divide-border">
                {parsed.map((entry) => (
                  <div
                    key={entry.word}
                    className="flex gap-3 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-primary min-w-[30%]">
                      {entry.word}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            data-ocid="vocab_modal.cancel_button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="vocab_modal.submit_button"
            onClick={handleSave}
            disabled={!name.trim() || parsed.length === 0 || isPending}
            className="font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Set"
            ) : (
              "Create Set"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
