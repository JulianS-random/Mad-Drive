// achievements.js
// Tracks run stats and unlocks achievements. Persists via storage.js

import { Storage } from "./storage.js";

export class Achievements {
  constructor() {
    this.state = Storage.load();
  }

  // Called when a level starts
  onLevelStart(levelIndex) {
    this.run = { level: levelIndex, start: performance.now(), flips: 0 };
  }

  // Called when a flip is detected
  onFlip() {
    if (!this.run) return;
    this.run.flips += 1;
  }

  // Called when player touches finish
  onWin(details) {
    // details: { level, timeMs, flips }
    const s = this.state;

    // update progress
    const next = Math.min(100, details.level + 1);
    if (next > (s.progress.unlocked || 1)) s.progress.unlocked = next;

    // stats
    s.stats.totalWins += 1;
    const prevBest = s.stats.bestTimes[details.level];
    if (!prevBest || details.timeMs < prevBest) {
      s.stats.bestTimes[details.level] = details.timeMs;
    }

    // achievements
    if (!s.achievements.firstWin) s.achievements.firstWin = true;
    if (s.progress.unlocked >= 10) s.achievements.level10 = true;
    if (s.progress.unlocked >= 50) s.achievements.level50 = true;
    if (s.progress.unlocked >= 100) s.achievements.level100 = true;

    if (details.flips === 0) s.achievements.noFlip = true;
    if (details.timeMs <= 12000) s.achievements.speedster = true;

    Storage.save(s);
  }

  // For UI rendering
  getList() {
    const s = this.state.achievements;
    return [
      ["✅", "⬜️"][s.firstWin ? 0 : 1] + " First Finish",
      ["✅", "⬜️"][s.level10 ? 0 : 1] + " Level 10",
      ["✅", "⬜️"][s.level50 ? 0 : 1] + " Level 50",
      ["✅", "⬜️"][s.level100 ? 0 : 1] + " Level 100",
      ["✅", "⬜️"][s.noFlip ? 0 : 1] + " Graceful Driver (no flip clear)",
      ["✅", "⬜️"][s.speedster ? 0 : 1] + " Speedster (sub-12s clear)"
    ];
  }

  // Expose current unlocked level for UI/Play button
  getUnlocked() {
    return this.state.progress.unlocked || 1;
  }
}
