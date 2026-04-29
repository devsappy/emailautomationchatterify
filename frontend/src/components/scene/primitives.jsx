import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------- Paper plane ---------- */
function makePaperPlaneGeometry() {
  const geometry = new THREE.BufferGeometry();
  const nose = [1.0, 0.0, 0.0];
  const leftWing = [-0.9, 0.0, -0.7];
  const rightWing = [-0.9, 0.0, 0.7];
  const tail = [-0.7, 0.06, 0.0];
  const belly = [-0.3, -0.18, 0.0];

  const positions = new Float32Array([
    ...nose, ...leftWing, ...tail,
    ...nose, ...tail, ...rightWing,
    ...nose, ...belly, ...leftWing,
    ...nose, ...rightWing, ...belly,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

const paperPlaneGeometry = makePaperPlaneGeometry();
const paperPlaneEdges = new THREE.EdgesGeometry(paperPlaneGeometry, 1);

export function PaperPlane({
  position = [0, 0, 0],
  scale = 1,
  color = "#f5f3eb",
  edgeColor = "#1f1f22",
  bobSpeed = 1,
  rollAmount = 0.18,
  yawSpeed = 0.06,
  bobAmount = 0.12,
}) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * bobSpeed) * bobAmount;
    ref.current.rotation.z = Math.sin(t * bobSpeed * 0.8) * rollAmount;
    ref.current.rotation.y = position[1] * 0 + t * yawSpeed;
    ref.current.rotation.x = Math.sin(t * bobSpeed * 0.5) * 0.06;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh geometry={paperPlaneGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          metalness={0.04}
          flatShading
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={paperPlaneEdges}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

/* ---------- Envelope ---------- */
const envelopeFlapGeometry = (() => {
  const g = new THREE.BufferGeometry();
  const positions = new Float32Array([
    -0.7, 0.5, 0,
    0.7, 0.5, 0,
    0, -0.08, 0,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
})();
const envelopeFlapEdges = new THREE.EdgesGeometry(envelopeFlapGeometry);

export function Envelope({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  drift = true,
  driftSpeed = 0.4,
  driftPhase = 0,
  paperColor = "#ecebe5",
  flapColor = "#d6d3c8",
}) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current || !drift) return;
    const t = state.clock.elapsedTime * driftSpeed + driftPhase;
    ref.current.position.x = position[0] + Math.sin(t * 0.7) * 0.18;
    ref.current.position.y = position[1] + Math.cos(t * 0.5) * 0.22;
    ref.current.rotation.x = rotation[0] + Math.sin(t * 0.4) * 0.12;
    ref.current.rotation.y = rotation[1] + Math.cos(t * 0.3) * 0.18;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.35) * 0.08;
  });
  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[1.4, 1.0, 0.04]} />
        <meshStandardMaterial color={paperColor} roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.022]} geometry={envelopeFlapGeometry}>
        <meshStandardMaterial
          color={flapColor}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments position={[0, 0, 0.024]} geometry={envelopeFlapEdges}>
        <lineBasicMaterial color="#3a3a3d" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

/* ---------- Dust ---------- */
export function Dust({
  count = 600,
  spread = [18, 12, 10],
  color = "#dcdcde",
  size = 0.018,
  opacity = 0.45,
  speed = 0.02,
}) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * spread[0];
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    }
    return arr;
  }, [count, spread]);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Trail of dotted "send path" ---------- */
export function SendArc({
  count = 24,
  radius = 2.2,
  color = "#888888",
  opacity = 0.55,
  rotation = [0, 0, 0],
}) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const angle = t * Math.PI * 0.9 - Math.PI * 0.45;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = Math.sin(angle) * radius * 0.4;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, [count, radius]);
  return (
    <points rotation={rotation}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
