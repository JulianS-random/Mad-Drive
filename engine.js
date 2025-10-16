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
    ctx.clearRect(0, 0, this.width, this.height);

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
