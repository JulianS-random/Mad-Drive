// main.js
// App bootstrap and wiring

import { GameEngine } from "./engine.js";
import { LevelLoader } from "./levelLoader.js";
import { UI } from "./ui.js";
import { Achievements } from "./achievements.js";

window.addEventListener("load", () => {
  const canvas = document.getElementById("game-canvas");

  const engine = new GameEngine(canvas);
  const levels = new LevelLoader(engine);
  const ach = new Achievements();
  const ui = new UI(engine, levels);

  // Wire engine events -> achievements
  engine.onWin  = (details) => ach.onWin(details);
  engine.onFlip = () => ach.onFlip();

  // UI needs achievements for unlocked-level and rendering
  ui.setAchievements(ach);

  // Notify achievements when a level starts
  const origLoad = levels.load.bind(levels);
  levels.load = (idx) => {
    ach.onLevelStart(idx);
    origLoad(idx);
  };

  // Show main menu
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("main-menu").classList.remove("hidden");
});
