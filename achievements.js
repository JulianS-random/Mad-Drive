// achievements.js
// Achievements with persistent storage + run stats

import { Storage } from "./storage.js";

export class Achievements {
  constructor() {
    this.state = Storage.load();
    this.run = null;
  }

  onLevelStart(levelIndex) {
    this.run = { level: levelIndex, start: performance.now(), flips: 0 };
  }

  onFlip() {
    if (this.run) this.run.flips += 1;
  }

  onWin(details) {
    // details: { level, timeMs, flips }
    const s = this.state;

    // Progress
    const next = Math.min(100, (details.level || 1) + 1);
    if (next > (s.progress.unlocked || 1)) s.progress.unlocked = next;

    // Stats
    s.stats.totalWins += 1;
    const prevBest = s.stats.bestTimes[details.level];
    if (!prevBest || details.timeMs < prevBest) s.stats.bestTimes[details.level] = details.timeMs;

    // Achievements
    if (!s.achievements.firstWin) s.achievements.firstWin = true;
    if (s.progress.unlocked >= 10) s.achievements.level10 = true;
    if (s.progress.unlocked >= 50) s.achievements.level50 = true;
    if (s.progress.unlocked >= 100) s.achievements.level100 = true;

    if ((details.flips || 0) === 0) s.achievements.noFlip = true;
    if (details.timeMs <= 12000) s.achievements.speedster = true;

    Storage.save(s);
  }

  getList() {
    const a = this.state.achievements;
    return [
      (a.firstWin ? "✅" : "⬜️") + " First Finish",
      (a.level10 ? "✅" : "⬜️") + " Level 10",
      (a.level50 ? "✅" : "⬜️") + " Level 50",
      (a.level100 ? "✅" : "⬜️") + " Level 100",
      (a.noFlip ? "✅" : "⬜️") + " Graceful Driver (no flip clear)",
      (a.speedster ? "✅" : "⬜️") + " Speedster (sub-12s clear)"
    ];
  }

  getUnlocked() {
    return this.state.progress.unlocked || 1;
  }
}
