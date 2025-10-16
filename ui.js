// ui.js
// Pause/menu UI, level select grid, achievements rendering; no folders

export class UI {
  constructor(engine, levelLoader) {
    this.engine = engine;
    this.levels = levelLoader;

    // DOM
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
    this._bindKeys();
    this._buildLevelGrid();

    // Chain engine.onWin so UI can auto-advance after achievements run
    const prevOnWin = this.engine.onWin;
    this.engine.onWin = (details) => {
      if (typeof prevOnWin === "function") prevOnWin(details);
      const next = Math.min(100, (this.levels.currentLevel || 1) + 1);
      setTimeout(() => this.levels.load(next), 800);
    };
  }

  setAchievements(ach) {
    this.ach = ach;
    this._paintLevelLocks(); // once we know unlocked
  }

  _bindButtons() {
    const E = this.el;

    E.play.addEventListener("click", () => {
      this.hideAllMenus();
      const unlocked = this.ach ? this.ach.getUnlocked() : 1;
      this.levels.load(Math.max(1, Math.min(100, unlocked)));
    });

    E.levelSelectBtn.addEventListener("click", () => {
      this._paintLevelLocks();
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

    E.backMain.addEventListener("click", () => this.show(E.mainMenu));
    E.backFromAch.addEventListener("click", () => this.show(E.mainMenu));
  }

  _bindKeys() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isPaused()) this.resume();
        else this.pause();
      }
    });
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
        const unlocked = this.ach ? this.ach.getUnlocked() : 1;
        if (lvl <= unlocked) {
          this.hideAllMenus();
          this.levels.load(lvl);
        }
      });
      grid.appendChild(b);
    }
    this._paintLevelLocks();
  }

  _paintLevelLocks() {
    if (!this.el.levelGrid) return;
    const unlocked = this.ach ? this.ach.getUnlocked() : 1;
    this.el.levelGrid.querySelectorAll("button").forEach(btn => {
      const lvl = Number(btn.dataset.level);
      const open = lvl <= unlocked;
      btn.disabled = !open;
      btn.style.opacity = open ? "1" : "0.4";
    });
  }

  _renderAchievements() {
    const list = this.el.achList;
    list.innerHTML = "";
    if (this.ach) {
      this.ach.getList().forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "Play to unlock achievements!";
      list.appendChild(li);
    }
  }

  isPaused() {
    return this.el.pauseMenu && !this.el.pauseMenu.classList.contains("hidden");
  }

  pause() { this.engine.pauseGame(); this.show(this.el.pauseMenu); }
  resume() { this.engine.resumeGame(); this.hide(this.el.pauseMenu); }

  show(node) { this.hideAllMenus(); node.classList.remove("hidden"); }
  hide(node) { node.classList.add("hidden"); }
  hideAllMenus() {
    [this.el.mainMenu, this.el.pauseMenu, this.el.levelSelect, this.el.achievements]
      .forEach(n => n && n.classList.add("hidden"));
  }
}
