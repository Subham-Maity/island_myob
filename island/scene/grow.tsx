"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import type { Group } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { useScene } from "./scene-context";

type GrowProps = Omit<ThreeElements["group"], "ref"> & {
  /** Whether the element should be on the island */
  show: boolean;
  /** Stagger delay (seconds) for the entrance */
  delay?: number;
  /** Twist around Y while popping in */
  spin?: boolean;
  children: ReactNode;
};

/**
 * GSAP-driven growth wrapper: elastic pop-in with a twist when `show` flips on,
 * snappy "back.in" shrink when it flips off. Elements stay mounted so the
 * transition can run in both directions.
 */
export function Grow({ show, delay = 0, spin = true, children, ...rest }: GrowProps) {
  const inner = useRef<Group>(null);
  const { reducedMotion } = useScene();

  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;
    gsap.killTweensOf([g.scale, g.rotation]);

    if (show) {
      g.visible = true;
      if (reducedMotion) {
        g.scale.setScalar(1);
        g.rotation.y = 0;
        return;
      }
      gsap.fromTo(
        g.scale,
        { x: 0.001, y: 0.001, z: 0.001 },
        { x: 1, y: 1, z: 1, duration: 1.5, delay, ease: "elastic.out(1, 0.45)" }
      );
      if (spin) {
        gsap.fromTo(
          g.rotation,
          { y: -Math.PI * 0.9 },
          { y: 0, duration: 1.3, delay, ease: "power3.out" }
        );
      }
    } else if (g.visible) {
      gsap.to(g.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion ? 0 : delay * 0.25,
        ease: "back.in(2.4)",
        onComplete: () => {
          g.visible = false;
        },
      });
    }
  }, [show, delay, spin, reducedMotion]);

  return (
    <group {...rest}>
      <group ref={inner} scale={0.001} visible={false}>
        {children}
      </group>
    </group>
  );
}
