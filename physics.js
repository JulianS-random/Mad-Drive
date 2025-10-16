// physics.js
// Sets up Matter.js world and exports engine, world, and helper functions

export const { Engine, Render, Runner, Bodies, Composite, Constraint, Body, Events } = Matter;

export const engine = Engine.create();
export const world = engine.world;
world.gravity.y = 1.2; // similar to Drive Mad — floaty but weighted

// World bounds
const floor = Bodies.rectangle(0, 500, 5000, 40, { isStatic: true, label: "floor" });
Composite.add(world, floor);

export function addBody(body) {
  Composite.add(world, body);
}

export function resetWorld() {
  Composite.clear(world, false);
  Composite.add(world, floor);
}
