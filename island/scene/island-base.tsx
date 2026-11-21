"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ISLAND_HALF, terrainHeight } from "./layout";
import { mulberry32 } from "./scene-context";

export { ISLAND_HALF };

const GRID = 22; // big soft facets, like the reference
const SIDE_SEGS = 10;
const DIRT_Y = -1.25; // flat underside
const INSET = 0.035;

const C = {
  grass: new THREE.Color("#a0d072"),
  grassWall: new THREE.Color("#8fc268"),
  dirtTop: new THREE.Color("#4b433e"),
  dirtBottom: new THREE.Color("#35302d"),
};

function pushTri(pos: number[], col: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: THREE.Color) {
  pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < 3; i++) col.push(color.r, color.g, color.b);
}

function toGeometry(pos: number[], col: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function useDiorama() {
  return useMemo(() => {
    const rand = mulberry32(77);
    const H = ISLAND_HALF;
    const jitter = (c: THREE.Color, amt: number) => c.clone().offsetHSL(0, 0, (rand() - 0.5) * amt);

    /* Top: gently rolling, flat-shaded, large facets */
    const tp: number[] = [];
    const tc: number[] = [];
    const step = (H * 2) / GRID;
    const v = (i: number, j: number) => {
      const x = -H + i * step;
      const z = -H + j * step;
      return new THREE.Vector3(x, terrainHeight(x, z), z);
    };
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const a = v(i, j);
        const b = v(i + 1, j);
        const c = v(i + 1, j + 1);
        const d = v(i, j + 1);
        const tris = (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
        for (const [p, q, r] of tris) pushTri(tp, tc, p, q, r, jitter(C.grass, 0.05));
      }
    }

    /* Perimeter ring */
    const P = SIDE_SEGS * 4;
    const ring: [number, number][] = [];
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < SIDE_SEGS; i++) {
        const u = -H + (2 * H * i) / SIDE_SEGS;
        ring.push(s === 0 ? [u, -H] : s === 1 ? [H, u] : s === 2 ? [-u, H] : [-H, -u]);
      }
    }
    // Wavy, torn lower edge of the grass lip (the green/dirt boundary)
    const lip = ring.map((_, k) => -0.36 + Math.sin(k * 0.62) * 0.1 + Math.sin(k * 1.7 + 1) * 0.06 + (rand() - 0.5) * 0.08);

    const gp: number[] = [];
    const gc: number[] = [];
    const dp: number[] = [];
    const dc: number[] = [];
    const ins = (H - INSET) / H;
    const dirtMid = C.dirtTop.clone().lerp(C.dirtBottom, 0.35);
    for (let k = 0; k < P; k++) {
      const n = (k + 1) % P;
      const [x0, z0] = ring[k];
      const [x1, z1] = ring[n];
      const g0 = new THREE.Vector3(x0, terrainHeight(x0, z0), z0);
      const g1 = new THREE.Vector3(x1, terrainHeight(x1, z1), z1);
      const g2 = new THREE.Vector3(x1, lip[n], z1);
      const g3 = new THREE.Vector3(x0, lip[k], z0);
      pushTri(gp, gc, g0, g1, g2, jitter(C.grassWall, 0.06));
      pushTri(gp, gc, g0, g2, g3, jitter(C.grassWall, 0.06));

      const d0 = new THREE.Vector3(x0 * ins, lip[k] + 0.04, z0 * ins);
      const d1 = new THREE.Vector3(x1 * ins, lip[n] + 0.04, z1 * ins);
      const d2 = new THREE.Vector3(x1 * ins, DIRT_Y, z1 * ins);
      const d3 = new THREE.Vector3(x0 * ins, DIRT_Y, z0 * ins);
      pushTri(dp, dc, d0, d1, d2, jitter(dirtMid, 0.05));
      pushTri(dp, dc, d0, d2, d3, jitter(dirtMid, 0.05));
    }
    // underside cap
    const o = H - INSET;
    const cap = [
      new THREE.Vector3(-o, DIRT_Y, -o),
      new THREE.Vector3(o, DIRT_Y, -o),
      new THREE.Vector3(o, DIRT_Y, o),
      new THREE.Vector3(-o, DIRT_Y, o),
    ];
    pushTri(dp, dc, cap[0], cap[1], cap[2], C.dirtBottom);
    pushTri(dp, dc, cap[0], cap[2], cap[3], C.dirtBottom);

    return { top: toGeometry(tp, tc), grassWall: toGeometry(gp, gc), dirtWall: toGeometry(dp, dc) };
  }, []);
}

/** Diorama block: soft rolling grass, a wavy green lip over a charcoal-brown body with a flat base. */
export function IslandBase() {
  const { top, grassWall, dirtWall } = useDiorama();
  return (
    <group>
      <mesh geometry={top} receiveShadow castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={grassWall} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={dirtWall} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
