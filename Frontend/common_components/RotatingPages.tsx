import { useRef } from "react";
import Tree from "../3D_Objects/Tree";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { PAGE_CONFIG } from '../App';
import { useAtom } from 'jotai';
import { activePageAtom } from '../atoms/dataAtoms';

export default function RotatingPages({ targetRotation }: { targetRotation: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pageRefs = useRef<{ [key: string]: THREE.Group }>({});
  const { camera } = useThree();
  const [activePage] = useAtom(activePageAtom);

  useFrame(() => {
    if (groupRef.current) {
      const current = groupRef.current.rotation.y;
      const delta = targetRotation - current;
      const normalizedDelta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
      const step = normalizedDelta * 0.1;
      groupRef.current.rotation.y += step;
    }

    Object.values(pageRefs.current).forEach((ref) => {
      if (ref) {
        ref.lookAt(camera.position.x, camera.position.y, camera.position.z);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {PAGE_CONFIG.map((page, index) => {
        const angle = (index / PAGE_CONFIG.length) * Math.PI * 2 + Math.PI / 2;
        const radius = 120;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        const shouldRender =
          page.id === activePage ||
          Math.abs(index - PAGE_CONFIG.findIndex(p => p.id === activePage)) <= 1;

        return (
          <group
            key={page.id}
            position={[x, 0, z]}
            ref={(el) => {
              if (el) pageRefs.current[page.id] = el;
            }}
          >
            {shouldRender && <page.component position={[0, 0, 0]} />}
          </group>
        );
      })}
      <group scale={200}>
        <Tree />
      </group>
    </group>
  );
}
