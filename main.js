// main.js
// Entry point for Drive Remix

import { GameEngine } from "./engine.js";
import { LevelLoader } from "./levelLoader.js";
import { UI } from "./ui.js";

window.addEventListener("load", () => {
  const canvas = document.getElementById("game-canvas");

  // Initialize main systems
  const engine = new GameEngine(canvas);
  const levels = new LevelLoader(engine);
  const ui = new UI(engine, levels);

  // Hide loading screen and show main menu
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("main-menu").classList.remove("hidden");
});
