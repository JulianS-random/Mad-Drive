// engine.js
// Game loop, rendering, camera, pause, and run tracking

import { Engine, Runner, Composite } from "./physics.js";
import { engine } from "./physics.js";
import { Car } from "./car.js";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    this.cameraX = 0;
    this.paused = false;

    // Run tracking & callbacks
    this.levelStart = 0;
    this.flipCount = 0;
    this.prevFlipped = false;
    this.currentLevelIndex = 1;
    this.onWin = null;
    this.onFlip = null;

    this.car = new Car(200, 400);

    this.runner = Runner.create();
    Runner.run(this.runner, engine);

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  beginLevel(levelIndex) {
    this.levelStart = performance.now();
    this.flipCount = 0;
    this.prevFlipped = false;
    this.currentLevelIndex = levelIndex;
  }

  pauseGame() { this.paused = true; }
  resumeGame() { this.paused = false; }

  loop() {
    if (!this.paused) {
      Engine.update(engine, 1000 / 60);
      this.car.update();

      // Flip counting (count posture transitions)
      const nowFlipped = this.car.isFlipped;
      if (nowFlipped && !this.prevFlipped) {
        this.flipCount += 1;
        if (typeof this.onFlip === "function") this.onFlip();
      }
      this.prevFlipped = nowFlipped;

      this.render();
    }
    requestAnimationFrame(this.loop);
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this;

    // Camera follow
    this.cameraX = this.car.position.x - width / 2;

    // Background
    ctx.clearRect(0, 0, width, height);
    const grd = ctx.createLinearGradient(0, height, 0, 0);
    grd.addColorStop(0, "#222");
    grd.addColorStop(1, "#555");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Draw all bodies
    const bodies = Composite.allBodies(engine.world);
    for (const b of bodies) {
      ctx.save();
      ctx.translate(b.position.x - this.cameraX, b.position.y);
      ctx.rotate(b.angle);

      // Finish sensor
      if (b.label === "finish") {
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 3;
        this._pathBody(ctx, b);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // Wheels
      if (b.circleRadius) {
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(0, 0, b.circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      // Car chassis
      if (b.label === "carChassis") {
        ctx.fillStyle = "#0ff";
        this._pathBody(ctx, b);
        ctx.fill();
        ctx.restore();
        continue;
      }

      // Level geometry & base floor
      ctx.fillStyle = b.isStatic ? "#444" : "#666";
      this._pathBody(ctx, b);
      ctx.fill();
      ctx.restore();
    }
  }

  _pathBody(ctx, body) {
    const v = body.vertices;
    ctx.beginPath();
    ctx.moveTo(v[0].x - body.position.x, v[0].y - body.position.y);
    for (let i = 1; i < v.length; i++) {
      ctx.lineTo(v[i].x - body.position.x, v[i].y - body.position.y);
    }
    ctx.closePath();
  }
}
