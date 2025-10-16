// physics.js
// Matter.js setup, exports engine/world and helpers

export const {
  Engine, Render, Runner, Bodies, Composite, Constraint, Body, Events
} = Matter;

export const engine = Engine.create();
export const world = engine.world;

// Gravity tuned for Drive Mad feel
world.gravity.y = 1.2;

// A very wide base floor (invisible "safety" floor); visual ground is from level pieces
const baseFloor = Bodies.rectangle(3000, 740, 10000, 60, { isStatic: true, label: "baseFloor" });
Composite.add(world, baseFloor);

export function addBody(b) { Composite.add(world, b); }
export function removeBody(b) { try { Composite.remove(world, b, true); } catch {} }
