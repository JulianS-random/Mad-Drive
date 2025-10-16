// storage.js
// Single-key localStorage save blob

const KEY = "driveRemixSave_v1";

const DEFAULT_SAVE = {
  progress: { unlocked: 1 },
  achievements: {
    firstWin: false,
    level10: false,
    level50: false,
    level100: false,
    noFlip: false,
    speedster: false
  },
  stats: { totalWins: 0, bestTimes: {} }
};

export const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT_SAVE);
      const parsed = JSON.parse(raw);
      return deepMerge(structuredClone(DEFAULT_SAVE), parsed);
    } catch { return structuredClone(DEFAULT_SAVE); }
  },
  save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  },
  reset() { localStorage.removeItem(KEY); }
};

function deepMerge(base, add) {
  for (const k in add) {
    if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      base[k] = deepMerge(base[k], add[k]);
    } else {
      base[k] = add[k];
    }
  }
  return base;
}
