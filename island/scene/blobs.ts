import * as THREE from "three";
import { mulberry32 } from "./scene-context";

/** [x, y, z, radius, yScale?] */
export type Blob = readonly [number, number, number, number, number?];

/**
 * Merge several jittered low-poly spheres into one flat-shaded "cloud": the chunky, soft
 * canopy shape from the reference. Faces are coloured by height (light top, deeper underside).
 */
export function blobCloud(blobs: readonly Blob[], seed: number, top: string, bottom: string, wobble = 0.1): THREE.BufferGeometry {
  const rand = mulberry32(seed);
  const pos: number[] = [];
  for (const [bx, by, bz, r, sy = 0.88] of blobs) {
    const g = new THREE.IcosahedronGeometry(r, 1).toNonIndexed();
    const p = g.attributes.position;
    const jit = new Map<string, [number, number, number]>();
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const key = `${v.x.toFixed(3)}|${v.y.toFixed(3)}|${v.z.toFixed(3)}`;
      if (!jit.has(key)) {
        jit.set(key, [(rand() - 0.5) * r * wobble * 2, (rand() - 0.5) * r * wobble * 2, (rand() - 0.5) * r * wobble * 2]);
      }
      const [jx, jy, jz] = jit.get(key)!;
      pos.push(bx + v.x + jx, by + v.y * sy + jy, bz + v.z + jz);
    }
    g.dispose();
  }
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    minY = Math.min(minY, pos[i]);
    maxY = Math.max(maxY, pos[i]);
  }
  const cTop = new THREE.Color(top);
  const cBot = new THREE.Color(bottom);
  const col: number[] = [];
  const c = new THREE.Color();
  for (let f = 0; f < pos.length; f += 9) {
    const cy = (pos[f + 1] + pos[f + 4] + pos[f + 7]) / 3;
    const t = (cy - minY) / (maxY - minY || 1);
    c.lerpColors(cBot, cTop, Math.pow(t, 0.8)).offsetHSL(0, 0, (rand() - 0.5) * 0.05);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}
