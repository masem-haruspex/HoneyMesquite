import { Billboard, Text, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { Department } from '../department';
import { degreesToRadians } from '../../helpers';

const GLOBE_SCALE = 1;
const GLOBE_POSITION = new THREE.Vector3(-8.1, 0.2, 17.7);
const MARKER_SIZE = 0.015;
const GLOBE_RADIUS = 0.94;
const TO_HOVERED_SPEED = 0.1;

export default function Globe({ departments = [], hoveredDepartment }:{ departments?: Department[]; hoveredDepartment?: Department | null }) {
  const { scene } = useGLTF('/models/globe.glb');
  const globeRef = useRef<THREE.Group>(null);
  const rotationRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const [autoRotation, setAutoRotation] = useState(true);
  const rotationSpeed = useRef(new THREE.Vector2(0, 0));
  const lastUpdateTime = useRef(0);

  function latLngToPosition(lat: number, lng: number){
    const latitudeOffset = lat >= 30 ? -1.2 : 0;
    const phi = (90 - lat + latitudeOffset) * (Math.PI / 180);
    const theta = (-lng + -10.0) * (Math.PI / 180);

    const position = new THREE.Vector3(
      -Math.sin(theta) * Math.sin(phi),
      Math.cos(phi),
      Math.cos(theta) * Math.sin(phi)
    ).normalize();

    return position;
  };

  function handlePointerDown(e: THREE.Event){
    const event = e as unknown as MouseEvent;
    event.stopPropagation();
    setIsDragging(true);
    setPreviousMousePosition({ x: event.clientX, y: event.clientY });
    setAutoRotation(false);
  };

  function handlePointerUp(){
    setIsDragging(false);
    if (!hoveredDepartment)
      setAutoRotation(true);
  };

  function handlePointerMove(e: THREE.Event){
    if (!isDragging || !rotationRef.current) return;

    const now = performance.now();
    if (now - lastUpdateTime.current < 16) return;

    const event = e as unknown as MouseEvent;
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    rotationSpeed.current.set(deltaX * 0.005, deltaY * 0.005);

    rotationRef.current.rotation.y += rotationSpeed.current.x;
    rotationRef.current.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, rotationRef.current.rotation.x + rotationSpeed.current.y)
    );

    setPreviousMousePosition({ x: event.clientX, y: event.clientY });
    lastUpdateTime.current = now;
  };

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((mat) => {
          if (mat && 'map' in mat && mat.map instanceof THREE.Texture) {
            const standardMat = mat as THREE.MeshStandardMaterial;

            standardMat.transparent = true;
            standardMat.depthWrite = false;
            standardMat.side = THREE.DoubleSide;

            standardMat.emissive = new THREE.Color(0x006644);
            standardMat.emissiveIntensity = 1.4;
            standardMat.emissiveMap = standardMat.map;

            standardMat.roughness = 1.0;
            standardMat.metalness = 0.0;
          }
        });
      }
    });
  }, [scene]);

  function rotateGlobeToPresentHoveredDepartment(){
    if(rotationRef.current && hoveredDepartment) {
      const markerDir = latLngToPosition(hoveredDepartment.latitude!, hoveredDepartment.longitude!);

      const angleY = Math.atan2(markerDir.z, markerDir.x) - degreesToRadians(33);
      let angleX = Math.asin(markerDir.y);

      if (hoveredDepartment.latitude! < 0) {
        const southernFactor = Math.abs(hoveredDepartment.latitude!) / 90;
        const extraRotation = degreesToRadians(20) * southernFactor;
        angleX -= extraRotation;
      }

      const targetY = THREE.MathUtils.lerp(rotationRef.current.rotation.y, angleY, TO_HOVERED_SPEED);
      const targetX = THREE.MathUtils.lerp(rotationRef.current.rotation.x, angleX, TO_HOVERED_SPEED);

      rotationRef.current.rotation.y = targetY;
      rotationRef.current.rotation.x = targetX;
    }
  }

  useFrame(() => {
    if(!isDragging && rotationRef.current){

      if (hoveredDepartment)
        rotateGlobeToPresentHoveredDepartment();

      else if(autoRotation)
        rotationRef.current.rotation.y += 0.002;

    }
  });

  const DepartmentMarker = ({ dept, isHovered }: { dept: Department; isHovered: boolean }) => {
    const markerRef = useRef<THREE.Group>(null);
    const pos = latLngToPosition(dept.latitude!, dept.longitude!);

    return (
      <group
        ref={markerRef}
        position={[
          pos.x * GLOBE_RADIUS * GLOBE_SCALE * 1.02,
          pos.y * GLOBE_RADIUS * GLOBE_SCALE * 1.02,
          pos.z * GLOBE_RADIUS * GLOBE_SCALE * 1.02,
        ]}
      >
        <mesh>
          <octahedronGeometry args={[MARKER_SIZE]} />
          <meshStandardMaterial
            color='#00aaff'
            emissive='#00aaff'
            emissiveIntensity={isHovered ? 10.5 : 0.5}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {isHovered && (
          <Billboard>
            <Text
              position={[0, MARKER_SIZE * 2.1, 0]}
              fontSize={0.035}
              color="white"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.002}
              outlineColor="#000000"
            >
              {dept.name}
            </Text>
          </Billboard>
        )}
      </group>
    );
  };

  return (
    <group
      position={GLOBE_POSITION}
      scale={[GLOBE_SCALE, GLOBE_SCALE, GLOBE_SCALE]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <group ref={rotationRef}>
        <primitive object={scene} ref={globeRef} />
        <group>
          {departments
            .filter((dept) => dept.latitude && dept.longitude)
            .map((dept) => (
              <DepartmentMarker
                key={dept.id}
                dept={dept}
                isHovered={hoveredDepartment?.id === dept.id}
              />
            ))}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/models/globe.glb');
