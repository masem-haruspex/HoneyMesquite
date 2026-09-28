// Tree.tsx
import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useAtom } from 'jotai'; 
import { showIceCubeAtom } from '../atoms/atomShowIceCube';
import HoloBox from "./HoloBox";
import { COLORS } from '../colors';

export default function Tree() {
  const { scene: tree } = useGLTF('/models/honey_mesquite.glb');
  const { scene: iceCube } = useGLTF('/models/cube_ice.glb');
  const treeRef = useRef<THREE.Group>(null);
  const [showIceCube] = useAtom(showIceCubeAtom); 

  useEffect(() => {
    if (tree) {
      tree.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat instanceof THREE.Material) {
                (mat as any).color?.set(COLORS.PRIMARY);
              }
            });
          } else {
            if (mesh.material instanceof THREE.Material) {
              (mesh.material as any).color?.set(COLORS.PRIMARY);
            }
          }
        }
      });
    }
    if(!showIceCube && tree){
      tree.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat instanceof THREE.Material) {
                (mat as any).color?.set(COLORS.INCOME);
              }
            });
          } else {
            if (mesh.material instanceof THREE.Material) {
              (mesh.material as any).color?.set(COLORS.INCOME);
            }
          }
        }
      });
    }
  }, [tree, showIceCube]);

  return (
    <group>
      <primitive ref={treeRef} object={tree} position={[0, -0.06, 0]} />
      {showIceCube &&
        <primitive object={iceCube} position={[0, 0, 0]} scale={0.365}  rotation={[0, Math.PI / 4.85, 0]} />
      }
      <HoloBox />
    </group>
  )
}
