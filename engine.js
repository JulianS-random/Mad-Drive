// engine.js
// Main game loop, rendering, camera, and pause state

import { Engine, Runner, Render, Body, Events, world, engine } from "./physics.js";
import { Car } from "./car.js";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.cameraX = 0;
    this.paused = false;

    this.car = new Car(200, 400);

    this.runner = Runner.create();
    Runner.run(this.runner, engine);

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  loop() {
    if (!this.paused) {
      Engine.update(engine, 1000 / 60);
      this.car.update();
      this.render();
    }
    requestAnimationFrame(this.loop);
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this;

    // Follow camera on the car
    this.cameraX = this.car.position.x - width / 2;

    // Background
    ctx.clearRect(0, 0, width, height);
    const grd = ctx.createLinearGradient(0, height, 0, 0);
    grd.addColorStop(0, "#222");
    grd.addColorStop(1, "#555");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Draw every body in the world
    const bodies = Matter.Composite.allBodies(Matter.Engine.world(this.runner ? this.runner : this.engine) || this.engine.world);
    // Fallback to engine.world
    const list = bodies && bodies.length ? bodies : Matter.Composite.allBodies(this.engine.world);

    list.forEach((b) => {
      ctx.save();
      ctx.translate(b.position.x - this.cameraX, b.position.y);
      ctx.rotate(b.angle);

      // Finish sensor = cyan outline
      if (b.label === "finish") {
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 3;
        this._pathBody(ctx, b);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Wheels (circles)
      if (b.circleRadius) {
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(0, 0, b.circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Chassis
      if (b.label === "carChassis") {
        ctx.fillStyle = "#0ff";
        this._pathBody(ctx, b);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Level geometry: flats/ramps
      if (b.isStatic) {
        ctx.fillStyle = "#444";
      } else {
        ctx.fillStyle = "#666";
      }
      this._pathBody(ctx, b);
      ctx.fill();

      ctx.restore();
    });
  }

  // helper to draw from vertices
  _pathBody(ctx, body) {
    const v = body.vertices;
    ctx.beginPath();
    ctx.moveTo(v[0].x - body.position.x, v[0].y - body.position.y);
    for (let i = 1; i < v.length; i++) {
      ctx.lineTo(v[i].x - body.position.x, v[i].y - body.position.y);
    }
    ctx.closePath();
  }

    // Camera follow
    this.cameraX = this.car.position.x - this.width / 2;

    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw ground
    ctx.fillStyle = "#444";
    ctx.fillRect(-this.cameraX, 680, 5000, 40);

    // Draw car
    const { chassis, wheelFront, wheelBack } = this.car;
    ctx.save();
    ctx.translate(chassis.position.x - this.cameraX, chassis.position.y);
    ctx.rotate(chassis.angle);
    ctx.fillStyle = "#0ff";
    ctx.fillRect(-this.car.width / 2, -this.car.height / 2, this.car.width, this.car.height);
    ctx.restore();

    // Wheels
    ctx.fillStyle = "#000";
    [wheelFront, wheelBack].forEach(w => {
      ctx.beginPath();
      ctx.arc(w.position.x - this.cameraX, w.position.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  pauseGame() { this.paused = true; }
  resumeGame() { this.paused = false; }
}
