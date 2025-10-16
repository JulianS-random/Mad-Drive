// levelLoader.js
// Loads levels, places finish trigger, resets car/world, and notifies engine on win.

import { engine, world, Bodies, Composite, Body, Events, resetWorld, addBody } from "./physics.js";

export class LevelLoader {
  constructor(engineRef) {
    this.engineRef = engineRef;
    this.currentLevel = 1;
    this.levelBodies = [];   // bodies created by the level (to remove on reload)
    this.finishSensor = null;
    this._ensureWinListener();
  }

  _ensureWinListener() {
    Events.on(engine, "collisionStart", (e) => {
      const pairs = e.pairs;
      for (const p of pairs) {
        if (!this.finishSensor) continue;
        if (p.bodyA === this.finishSensor || p.bodyB === this.finishSensor) {
          // win!
          if (typeof this.engineRef.onWin === "function") {
            this.engineRef.onWin();
          }
        }
      }
    });
  }

  restartCurrent() {
    this.load(this.currentLevel);
  }

  load(levelIndex = 1) {
    this.currentLevel = levelIndex;

    // Clear only level-created bodies (keep the always-present floor from physics.js)
    this._removeLevelBodies();

    // Optionally reset velocities on the car if it exists
    if (this.engineRef.car) {
      Body.setVelocity(this.engineRef.car.chassis, { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.chassis, 0);
      Body.setAngle(this.engineRef.car.chassis, 0);

      Body.setVelocity(this.engineRef.car.wheelFront, { x: 0, y: 0 });
      Body.setVelocity(this.engineRef.car.wheelBack, { x: 0, y: 0 });
      Body.setAngularVelocity(this.engineRef.car.wheelFront, 0);
      Body.setAngularVelocity(this.engineRef.car.wheelBack, 0);
    }

    // Build simple parametric level layout (Wave 4 will add full geometry library)
    const cfg = this._levelParams(levelIndex);

    // Place car at start
    if (this.engineRef.car) {
      Body.setPosition(this.engineRef.car.chassis, { x: cfg.startX, y: cfg.startY });
      Body.setPosition(this.engineRef.car.wheelFront, { x: cfg.startX + 45, y: cfg.startY + 20 });
      Body.setPosition(this.engineRef.car.wheelBack, { x: cfg.startX - 45, y: cfg.startY + 20 });
    }

    // Create platforms/ramps basic set (more variety comes in Wave 4)
    const bodies = [];

    // Base platform near start (aligned with the implicit floor at y~500)
    bodies.push(Bodies.rectangle(cfg.startX + 300, 500, 800, 40, { isStatic: true, label: "platform" }));

    // Mid ramp
    if (cfg.ramp) {
      bodies.push(
        Bodies.rectangle(cfg.ramp.x, cfg.ramp.y, cfg.ramp.w, 20, {
          isStatic: true,
          angle: cfg.ramp.angle,
          label: "ramp",
        })
      );
    }

    // Elevated platform / gap
    if (cfg.platform) {
      bodies.push(Bodies.rectangle(cfg.platform.x, cfg.platform.y, cfg.platform.w, 20, {
        isStatic: true, label: "platformHigh"
      }));
    }

    // Finish sensor (thin vertical line)
    this.finishSensor = Bodies.rectangle(cfg.finishX, 440, 10, 200, {
      isStatic: true, isSensor: true, label: "finish"
    });
    bodies.push(this.finishSensor);

    bodies.forEach(b => addBody(b));
    this.levelBodies = bodies;

    // Nudge camera immediately
    this.engineRef.cameraX = this.engineRef.car.chassis.position.x - this.engineRef.width / 2;

    // Make sure we are in play state
    this.engineRef.resumeGame();
  }

  _removeLevelBodies() {
    if (!this.levelBodies.length) return;
    this.levelBodies.forEach(b => {
      try { Composite.remove(world, b, true); } catch {}
    });
    this.levelBodies = [];
    this.finishSensor = null;
  }

  _levelParams(i) {
    // Simple difficulty ramp; Wave 4 will replace with full 100-level dataset
    const startX = 200;
    const startY = 400;

    const finishX = 1200 + (i - 1) * 120; // slightly longer each level

    // create a ramp every few levels, angle grows a bit
    const rampEvery = 3;
    const rampEnabled = i % rampEvery !== 0 ? {
      x: 700 + (i % rampEvery) * 60,
      y: 520 - Math.min(120, i * 2),
      w: 300,
      angle: -Math.min(Math.PI / 10, 0.03 * i) // gentle up-ramp
    } : null;

    // add an elevated platform every 4 levels
    const platformEvery = 4;
    const platformEnabled = i % platformEvery === 0 ? {
      x: 950 + (i * 10),
      y: 440 - Math.min(140, i * 2),
      w: 260 + (i % 5) * 20
    } : null;

    return {
      startX, startY, finishX,
      ramp: rampEnabled,
      platform: platformEnabled
    };
  }
}
