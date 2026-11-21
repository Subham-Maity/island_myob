/** Shared terrain layout: the island mesh flattens a plateau where the pond/stream sit. */
export const ISLAND_HALF = 2.1;
export const POND = { x: 0.7, z: 0.8, r: 0.62, sx: 1.2 } as const;
export const STREAM_RIM = 0.27;
/** Flat ground height inside the water plateau, and the water surface just above it */
export const FLAT_Y = 0.03;
export const WATER_Y = 0.065;

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 1 on the pond/stream footprint (+ margin), easing to 0 on the surrounding hills */
export function flatMask(x: number, z: number): number {
  const rx = POND.r * POND.sx + 0.28;
  const rz = POND.r + 0.28;
  const d = Math.hypot((x - POND.x) / rx, (z - POND.z) / rz);
  const pond = ss(1.25, 0.9, d);
  const stream = ss(STREAM_RIM + 0.3, STREAM_RIM + 0.05, Math.abs(z - POND.z)) * ss(POND.x + 0.2, POND.x + 0.8, x);
  return Math.max(pond, stream);
}

/** Soft, low-frequency rolling hills (>= 0) so big flat facets read as gentle ground */
export function terrainHeight(x: number, z: number): number {
  const hills =
    0.1 + Math.sin(x * 0.85 + 0.5) * Math.cos(z * 0.75 - 0.4) * 0.06 + Math.sin(x * 1.5 + z * 1.2 + 1.3) * 0.03;
  const m = flatMask(x, z);
  return hills * (1 - m) + FLAT_Y * m;
}
