# Listen and Spell

## Current State
VocabPlay is a vocabulary learning app with 5 game modes (Flashcards, Multiple Choice, Matching, Spelling Bee, Audio Spelling). The home page allows students to play but also shows edit/delete/add buttons for word sets. The teacher dashboard manages word sets and tracks scores.

## Requested Changes (Diff)

### Add
- New game: **Listen & Choose** -- plays audio of a word, student selects the correct word from 4 multiple choice options
- Audio Spelling game renamed to **Listen & Fill** (listen to audio, type the word)

### Modify
- App name changed from "VocabPlay" to "Listen and Spell" everywhere (header, title, branding)
- HomePage: remove edit, delete, and "New Set" buttons/actions -- students can only press Play. Remove VocabModal from home page.
- GameSelectPage: only show Spelling Bee, Listen & Fill (audio spelling), and new Listen & Choose. Remove Flashcards, Multiple Choice, Matching.
- Teacher Dashboard: retains full ability to add, edit, delete word lists (no change to teacher functionality)

### Remove
- FlashcardsGame (page + App.tsx routing)
- MultipleChoiceGame (page + App.tsx routing)
- MatchingGame (page + App.tsx routing)

## Implementation Plan
1. Update HomePage.tsx: remove edit/delete/add set buttons from SetCard and header; only keep Play button; remove VocabModal usage; update app name branding
2. Update GameSelectPage.tsx: only show 3 games (Spelling Bee, Listen & Fill, Listen & Choose)
3. Create ListenChooseGame.tsx: audio plays automatically, 4 word choices shown, correct answer tracked, score screen at end
4. Update App.tsx: remove flashcards/quiz/matching view types and GameWrapper branches; add listen-choose view; update imports
5. Rename AudioSpelling references to "Listen & Fill" in UI labels
