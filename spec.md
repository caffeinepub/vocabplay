# VocabPlay

## Current State
Four game modes: Flashcards, Multiple Choice, Matching, Spelling Bee. Spelling Bee shows the definition and a tap-to-hear button.

## Requested Changes (Diff)

### Add
- New game mode: Audio Spelling. Word audio auto-plays when each card loads. No definition shown. Students hear the word and type the spelling. Replay button available. Listed on GameSelectPage.

### Modify
- GameSelectPage.tsx: Add Audio Spelling game card.
- App.tsx: Add audio-spelling view type, render AudioSpellingGame.

### Remove
- Nothing.

## Implementation Plan
1. Create AudioSpellingGame.tsx: auto-play audio on card load, replay button, type-to-spell input, score tracking, record result.
2. Update GameSelectPage.tsx to add the new game.
3. Update App.tsx to handle audio-spelling view.
