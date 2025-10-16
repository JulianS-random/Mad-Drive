// ui.js
// Pause menu, level select, and basic achievements hooks (progress saving)

import { GameEngine } from "./engine.js";
import { LevelLoader } from "./levelLoader.js";

export class UI {
  constructor(engine, levelLoader) {
    this.engine = engine;
    this.levels = levelLoader;
    this.el = {
      mainMenu: document.getElementById("main-menu"),
      pauseMenu: document.getElementById("pause-menu"),
      levelSelect: document.getElementById("level-select-menu"),
      achievements: document.getElementById("achievements-menu"),
      loading: document.getElementById("loading-screen"),
      levelGrid: document.getElementById("level-grid"),
      achList: document.getElementById("achievements-list"),
      // buttons
      play: document.getElementById("play-btn"),
      levelSelectBtn: document.getElementById("level-select-btn"),
      achievementsBtn: document.getElementById("achievements-btn"),
      resume: document.getElementById("resume-btn"),
      restart: document.getElementById("restart-btn"),
      quit: document.getElementById("quit-btn"),
      backMain: document.getElementById("back-to-main"),
      backFromAch: document.getElementById("back-from-achievements"),
    };

    this._bindButtons();
    this._buildLevelGrid();
    this._bindKeys();

    // restore progress
    this.progress = this._loadProgress();
    this._paintLevelLocks();

    // listen for level completion
    this.engine.onWin = () => {
      const next = Math.min(100, this.levels.currentLevel + 1);
      if (next > this.progress.unlocked) {
        this.progress.unlocked = next;
        this._saveProgress();
        this._paintLevelLocks();
      }
      // auto-continue after a small delay
      setTimeout(() => this.levels.load(next), 800);
    };
  }

  _bindButtons() {
    const E = this.el;

    E.play.addEventListener("click", () => {
      this.hideAllMenus();
      const startAt = Math.max(1, Math.min(100, this.progress.unlocked || 1));
      this.levels.load(startAt);
    });

    E.levelSelectBtn.addEventListener("click", () => {
      this.show(E.levelSelect);
    });

    E.achievementsBtn.addEventListener("click", () => {
      this._renderAchievements();
      this.show(E.achievements);
    });

    E.resume.addEventListener("click", () => this.resume());
    E.restart.addEventListener("click", () => this.levels.restartCurrent());
    E.quit.addEventListener("click", () => {
      this.engine.pauseGame();
      this.show(E.mainMenu);
    });

    E.backMain.addEventListener("click", () => {
      this.show(E.mainMenu);
    });

    E.backFromAch.addEventListener("click", () => {
      this.show(E.mainMenu);
    });
  }

  _bindKeys() {
    // ESC to toggle pause
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isPaused()) this.resume();
        else this.pause();
      }
    });
  }

  isPaused() {
    return this.el.pauseMenu && !this.el.pauseMenu.classList.contains("hidden");
  }

  pause() {
    this.engine.pauseGame();
    this.show(this.el.pauseMenu);
  }

  resume() {
    this.engine.resumeGame();
    this.hide(this.el.pauseMenu);
  }

  show(node) {
    this.hideAllMenus();
    node.classList.remove("hidden");
  }

  hide(node) {
    node.classList.add("hidden");
  }

  hideAllMenus() {
    [this.el.mainMenu, this.el.pauseMenu, this.el.levelSelect, this.el.achievements]
      .forEach(n => n && n.classList.add("hidden"));
  }

  _buildLevelGrid() {
    const grid = this.el.levelGrid;
    grid.innerHTML = "";
    for (let i = 1; i <= 100; i++) {
      const b = document.createElement("button");
      b.textContent = i;
      b.dataset.level = i;
      b.addEventListener("click", () => {
        const lvl = Number(b.dataset.level);
        if (lvl <= (this.progress.unlocked || 1)) {
          this.hideAllMenus();
          this.levels.load(lvl);
        }
      });
      grid.appendChild(b);
    }
  }

  _paintLevelLocks() {
    const unlocked = this.progress.unlocked || 1;
    this.el.levelGrid.querySelectorAll("button").forEach(btn => {
      const lvl = Number(btn.dataset.level);
      if (lvl <= unlocked) {
        btn.disabled = false;
        btn.style.opacity = "1";
      } else {
        btn.disabled = true;
        btn.style.opacity = "0.4";
      }
    });
  }

  _renderAchievements() {
    // Placeholder list (Wave 5 will add real logic)
    const list = this.el.achList;
    list.innerHTML = "";
    const items = [
      { id: "firstWin", name: "First Finish", unlocked: (this.progress.unlocked || 1) > 1 },
      { id: "tenWins", name: "Level 10", unlocked: (this.progress.unlocked || 1) >= 10 },
      { id: "fiftyWins", name: "Level 50", unlocked: (this.progress.unlocked || 1) >= 50 },
      { id: "hundredWins", name: "Level 100", unlocked: (this.progress.unlocked || 1) >= 100 },
      { id: "noFlip", name: "Graceful Driver (no flip in a level)", unlocked: false }, // to be wired in Wave 5
    ];
    items.forEach(it => {
      const li = document.createElement("li");
      li.textContent = `${it.unlocked ? "✅" : "⬜️"} ${it.name}`;
      list.appendChild(li);
    });
  }

  _loadProgress() {
    try {
      const raw = localStorage.getItem("driveRemixProgress");
      return raw ? JSON.parse(raw) : { unlocked: 1 };
    } catch {
      return { unlocked: 1 };
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem("driveRemixProgress", JSON.stringify(this.progress));
    } catch { /* ignore */ }
  }
}
