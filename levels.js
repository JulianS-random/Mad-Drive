// levels.js
// Generates 100 original levels inspired by Drive Mad-style layouts.
// Each level returns a simple config the loader understands.

export const LEVELS = Array.from({ length: 100 }, (_, i) => makeLevel(i + 1));

function makeLevel(n) {
  // Global layout constants
  const START_X = 200;
  const START_Y = 400;
  const BASE_FINISH = 1200;
  const EXTRA = 120 * (n - 1); // slightly longer per level

  const finishX = BASE_FINISH + EXTRA;

  // Difficulty ramps
  const hasRamp = n % 2 === 1;               // odd levels have ramps
  const hasHighPlat = n % 3 === 0;           // every 3rd level a high platform
  const hasGaps = n % 4 === 0;               // every 4th level introduces a gap
  const hasBumps = n % 5 === 0;              // every 5th level adds bumps
  const hasStairs = n % 6 === 0;             // every 6th level adds staircase
  const rampAngle = -Math.min(0.12, 0.02 * n);   // steeper as n grows
  const run = [];

  // Always add a starter platform to get moving
  run.push(flat(START_X + 250, 500, 700));

  // Vary the middle section
  let cursor = START_X + 600;

  if (hasRamp) {
    run.push(ramp(cursor + 120, 520 - Math.min(120, 2 * n), 320, rampAngle));
    cursor += 360;
  } else {
    run.push(flat(cursor + 160, 520, 360));
    cursor += 360;
  }

  if (hasHighPlat) {
    run.push(flat(cursor + 200, 440 - Math.min(160, 2 * n), 280));
    cursor += 300;
  }

  if (hasGaps) {
    // two small platforms with a jump between
    run.push(flat(cursor + 160, 500, 180));
    cursor += 260;
    run.push(flat(cursor + 160, 500, 220));
    cursor += 240;
  } else {
    run.push(flat(cursor + 220, 500, 440));
    cursor += 500;
  }

  if (hasBumps) {
    // three road bumps
    const baseY = 520;
    for (let k = 0; k < 3; k++) {
      run.push(bump(cursor + 160 + k * 120, baseY - 10));
    }
    cursor += 500;
  }

  if (hasStairs) {
    // ascending staircase
    const steps = 5;
    for (let s = 0; s < steps; s++) {
      run.push(flat(cursor + 120 + s * 90, 500 - s * 22, 90));
    }
    cursor += 90 * steps + 140;
  }

  // Final approach to finish
  run.push(flat(finishX - 120, 500, 240));

  return {
    startX: START_X,
    startY: START_Y,
    finishX,
    pieces: run
  };
}

/** Piece helpers the loader understands */
function flat(x, y, w) {
  return { kind: "flat", x, y, w, h: 20 };
}
function ramp(x, y, w, angle) {
  return { kind: "ramp", x, y, w, h: 20, angle };
}
function bump(x, y) {
  // drawn as a short narrow platform (visual "bump")
  return { kind: "flat", x, y, w: 60, h: 16 };
}
