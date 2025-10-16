// car.js
// Blocky two-wheel car with springy suspension and simple input

import { Bodies, Constraint, Composite, Body, world } from "./physics.js";

export class Car {
  constructor(x, y) {
    this.width = 120;
    this.height = 30;

    // feel tweaks
    this.torque = 0.002;      // wheel torque
    this.restitution = 0.2;

    this.chassis = Bodies.rectangle(x, y, this.width, this.height, {
      density: 0.002, friction: 0.9, restitution: this.restitution, label: "carChassis"
    });

    const wheelOpts = { friction: 0.95, restitution: 0.3, density: 0.002 };
    this.wheelFront = Bodies.circle(x + 45, y + 20, 20, wheelOpts);
    this.wheelBack  = Bodies.circle(x - 45, y + 20, 20, wheelOpts);

    const spring = { stiffness: 0.45, damping: 0.12, length: 25 };
    this.suspensionFront = Constraint.create({
      bodyA: this.chassis, bodyB: this.wheelFront, pointA: { x: 45, y: 15 }, ...spring
    });
    this.suspensionBack = Constraint.create({
      bodyA: this.chassis, bodyB: this.wheelBack, pointA: { x: -45, y: 15 }, ...spring
    });

    Composite.add(world, [
      this.chassis, this.wheelFront, this.wheelBack, this.suspensionFront, this.suspensionBack
    ]);

    this.input = { left:false, right:false };
    this.isFlipped = false;
    this._bindInput();
  }

  _bindInput() {
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") this.input.left = true;
      if (e.key === "ArrowRight"|| e.key.toLowerCase() === "d") this.input.right = true;
    });
    window.addEventListener("keyup", e => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") this.input.left = false;
      if (e.key === "ArrowRight"|| e.key.toLowerCase() === "d") this.input.right = false;
    });
  }

  update() {
    if (this.input.left)  Body.applyTorque(this.wheelBack, -this.torque);
    if (this.input.right) Body.applyTorque(this.wheelBack,  this.torque);

    // flip posture: chassis rotated beyond 90° (mod 360)
    const a = Math.abs(this.chassis.angle) % (Math.PI * 2);
    this.isFlipped = a > Math.PI / 2 && a < 3 * Math.PI / 2;
  }

  get position() {
    return this.chassis.position;
  }
}
