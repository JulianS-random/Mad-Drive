// levelLoader.js
// Loads levels from LEVELS (levels.js), builds geometry, places finish sensor.

import { engine, world, Bodies, Composite, Body, Events, addBody } from "./physics.js";
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
          if (typeof this.engineRef.onWin === "function") this.engineRef.onWin();
          break;
        }
      }
    });
  }

  restartCurrent() { this.load(this.currentLevel); }

  load(levelIndex = 1) {
    // clamp
    levelIndex = Math.max(1, Math.min(LEVELS.length, levelIndex));
    this.currentLevel = levelIndex;

    // Remove previous level bodies
    this._clearLevel();

    // Reset car dynamics and position to level start
    if (this.engineRef.car) {
      const { startX, startY } = LEVELS[levelIndex - 1];
      Body.setPosition(this.engineRef.car.chassis, { x: startX, y: startY });
      Body.setAngle(this.engineRef.car.chassis, 0);
      Body.setVelocity(this.engineRef.car.chassis, { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.chassis, 0);

      Body.setPosition(this.engineRef.car.wheelFront, { x: startX + 45, y: startY + 20 });
      Body.setPosition(this.engineRef.car.wheelBack,  { x: startX - 45, y: startY + 20 });
      Body.setVelocity(this.engineRef.car.wheelFront, { x: 0, y: 0 });
      Body.setVelocity(this.engineRef.car.wheelBack,  { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.wheelFront, 0);
      Body.setAngularVelocity(this.engineRef.car.wheelBack,  0);
    }

    // Build geometry for the level
    const cfg = LEVELS[levelIndex - 1];
    const bodies = [];

    // Pieces
    for (const piece of cfg.pieces) {
      if (piece.kind === "flat") {
        bodies.push(Bodies.rectangle(piece.x, piece.y, piece.w, piece.h, {
          isStatic: true, label: "flat"
        }));
      } else if (piece.kind === "ramp") {
        bodies.push(Bodies.rectangle(piece.x, piece.y, piece.w, piece.h, {
          isStatic: true, angle: piece.angle, label: "ramp"
        }));
      }
    }

    // Finish sensor (thin vertical bar)
    this.finishSensor = Bodies.rectangle(cfg.finishX, 440, 12, 200, {
      isStatic: true, isSensor: true, label: "finish"
    });
    bodies.push(this.finishSensor);

    bodies.forEach(b => addBody(b));
    this.levelBodies = bodies;

    // Camera snap to player
    this.engineRef.cameraX = this.engineRef.car.chassis.position.x - this.engineRef.width / 2;
    this.engineRef.resumeGame();
  }

  _clearLevel() {
    if (!this.levelBodies.length) return;
    for (const b of this.levelBodies) {
      try { Composite.remove(world, b, true); } catch {}
    }
    this.levelBodies = [];
    this.finishSensor = null;
  }
}
