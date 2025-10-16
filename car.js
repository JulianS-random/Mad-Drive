// car.js
// Handles the vehicle creation and input control

import { Engine, Bodies, Constraint, Composite, Body, world } from "./physics.js";

export class Car {
  constructor(x, y) {
    this.speed = 0.04;
    this.torque = 0.002;
    this.isFlipped = false;
    this.width = 120;
    this.height = 30;

    // Body parts
    this.chassis = Bodies.rectangle(x, y, this.width, this.height, {
      density: 0.002,
      friction: 0.8,
      label: "carChassis",
    });

    const wheelOptions = { friction: 0.9, restitution: 0.3, density: 0.002 };
    this.wheelFront = Bodies.circle(x + 45, y + 20, 20, wheelOptions);
    this.wheelBack = Bodies.circle(x - 45, y + 20, 20, wheelOptions);

    // Suspension springs
    const springOptions = { stiffness: 0.4, damping: 0.1, length: 20 };
    this.suspensionFront = Constraint.create({
      bodyA: this.chassis,
      bodyB: this.wheelFront,
      pointA: { x: 45, y: 15 },
      length: 25,
      ...springOptions,
    });
    this.suspensionBack = Constraint.create({
      bodyA: this.chassis,
      bodyB: this.wheelBack,
      pointA: { x: -45, y: 15 },
      length: 25,
      ...springOptions,
    });

    Composite.add(world, [
      this.chassis,
      this.wheelFront,
      this.wheelBack,
      this.suspensionFront,
      this.suspensionBack,
    ]);

    // Input state
    this.input = { left: false, right: false };
    this.setupInput();
  }

  setupInput() {
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft" || e.key === "a") this.input.left = true;
      if (e.key === "ArrowRight" || e.key === "d") this.input.right = true;
    });
    window.addEventListener("keyup", e => {
      if (e.key === "ArrowLeft" || e.key === "a") this.input.left = false;
      if (e.key === "ArrowRight" || e.key === "d") this.input.right = false;
    });
  }

  update() {
    if (this.input.left) Body.applyTorque(this.wheelBack, -this.torque);
    if (this.input.right) Body.applyTorque(this.wheelBack, this.torque);

    // Detect flip
    const angle = Math.abs(this.chassis.angle) % (2 * Math.PI);
    this.isFlipped = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
  }

  get position() {
    return this.chassis.position;
  }
}
