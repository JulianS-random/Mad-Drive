// levels.js
// Programmatically generates 100 original, Drive Mad–style levels

export const LEVELS = Array.from({ length: 100 }, (_, i) => makeLevel(i + 1));

function makeLevel(n) {
  const START_X = 200;
  const START_Y = 400;
  const BASE_FINISH = 1200;
  const EXTRA = 120 * (n - 1);
  const finishX = BASE_FINISH + EXTRA;

  // Feature gates
  const hasRamp     = n % 2 === 1;
  const hasHighPlat = n % 3 === 0;
  const hasGaps     = n % 4 === 0;
  const hasBumps    = n % 5 === 0;
  const hasStairs   = n % 6 === 0;

  const rampAngle = -Math.min(0.12, 0.02 * n);
  const pieces = [];

  // Starter road
  pieces.push(flat(START_X + 250, 500, 700));

  // Middle section
  let cursor = START_X + 600;

  if (hasRamp) {
    pieces.push(ramp(cursor + 120, 520 - Math.min(120, 2 * n), 320, rampAngle));
    cursor += 360;
  } else {
    pieces.push(flat(cursor + 160, 520, 360)); cursor += 360;
  }

  if (hasHighPlat) {
    pieces.push(flat(cursor + 200, 440 - Math.min(160, 2 * n), 280));
    cursor += 300;
  }

  if (hasGaps) {
    pieces.push(flat(cursor + 160, 500, 180)); cursor += 260;
    pieces.push(flat(cursor + 160, 500, 220)); cursor += 240;
  } else {
    pieces.push(flat(cursor + 220, 500, 440)); cursor += 500;
  }

  if (hasBumps) {
    const baseY = 520;
    for (let k = 0; k < 3; k++) pieces.push(bump(cursor + 160 + k * 120, baseY - 10));
    cursor += 500;
  }

  if (hasStairs) {
    const steps = 5;
    for (let s = 0; s < steps; s++) pieces.push(flat(cursor + 120 + s * 90, 500 - s * 22, 90));
    cursor += 90 * steps + 140;
  }

  // Final approach to finish
  pieces.push(flat(finishX - 120, 500, 240));

  return { startX: START_X, startY: START_Y, finishX, pieces };
}

// Helpers the loader understands
function flat(x, y, w, h = 20) { return { kind:"flat", x, y, w, h }; }
function ramp(x, y, w, angle, h = 20) { return { kind:"ramp", x, y, w, h, angle }; }
function bump(x, y) { return { kind:"flat", x, y, w: 60, h: 16 }; }
