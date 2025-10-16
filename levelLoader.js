// levelLoader.js
// Builds a level from LEVELS, places finish sensor, handles win

import { engine, world, Bodies, Composite, Body, Events, addBody, removeBody } from "./physics.js";
import { LEVELS } from "./levels.js";

export class LevelLoader {
  constructor(engineRef) {
    this.engineRef = engineRef;
    this.currentLevel = 1;
    this.levelBodies = [];
    this.finishSensor = null;

    this._hookWinCheck();
  }

  _hookWinCheck() {
    Events.on(engine, "collisionStart", (e) => {
      if (!this.finishSensor) return;
      for (const p of e.pairs) {
        if (p.bodyA === this.finishSensor || p.bodyB === this.finishSensor) {
          if (typeof this.engineRef.onWin === "function") {
            const timeMs = Math.max(0, performance.now() - (this.engineRef.levelStart || performance.now()));
            this.engineRef.onWin({
              level: this.currentLevel,
              timeMs,
              flips: this.engineRef.flipCount || 0
            });
          }
          break;
        }
      }
    });
  }

  restartCurrent() { this.load(this.currentLevel); }

  load(levelIndex = 1) {
    const max = LEVELS.length;
    levelIndex = Math.max(1, Math.min(max, levelIndex));
    this.currentLevel = levelIndex;

    // Clear existing level bodies
    this._clearLevel();

    // Get config
    const cfg = LEVELS[levelIndex - 1];

    // Position car
    if (this.engineRef.car) {
      const sx = cfg.startX, sy = cfg.startY;
      Body.setPosition(this.engineRef.car.chassis, { x: sx, y: sy });
      Body.setAngle(this.engineRef.car.chassis, 0);
      Body.setVelocity(this.engineRef.car.chassis, { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.chassis, 0);

      Body.setPosition(this.engineRef.car.wheelFront, { x: sx + 45, y: sy + 20 });
      Body.setPosition(this.engineRef.car.wheelBack,  { x: sx - 45, y: sy + 20 });
      Body.setVelocity(this.engineRef.car.wheelFront, { x: 0, y: 0 });
      Body.setVelocity(this.engineRef.car.wheelBack,  { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.wheelFront, 0);
      Body.setAngularVelocity(this.engineRef.car.wheelBack,  0);
    }

    // Build geometry
    const made = [];
    for (const piece of cfg.pieces) {
      if (piece.kind === "flat") {
        made.push(Bodies.rectangle(piece.x, piece.y, piece.w, piece.h, { isStatic: true, label: "flat" }));
      } else if (piece.kind === "ramp") {
        made.push(Bodies.rectangle(piece.x, piece.y, piece.w, piece.h, { isStatic: true, angle: piece.angle, label: "ramp" }));
      }
    }

    // Finish sensor
    this.finishSensor = Bodies.rectangle(cfg.finishX, 440, 12, 200, { isStatic: true, isSensor: true, label: "finish" });
    made.push(this.finishSensor);

    for (const b of made) addBody(b);
    this.levelBodies = made;

    // Start run tracking + camera
    this.engineRef.beginLevel(levelIndex);
    this.engineRef.resumeGame();
    this.engineRef.cameraX = this.engineRef.car.chassis.position.x - this.engineRef.width / 2;
  }

  _clearLevel() {
    for (const b of this.levelBodies) removeBody(b);
    this.levelBodies = [];
    this.finishSensor = null;
  }
}
