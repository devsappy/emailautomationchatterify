import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { Dust, Envelope, PaperPlane } from "./scene/primitives.jsx";

function Drifters() {
  return (
    <>
      <Envelope position={[-5.2, 1.8, -4]} rotation={[0.2, 0.4, 0]} scale={0.55} driftPhase={0.5} />
      <Envelope position={[5.6, -1.2, -5]} rotation={[-0.1, -0.5, 0.1]} scale={0.6} driftPhase={1.2} />
      <Envelope position={[3.2, 2.4, -7]} rotation={[0.15, -0.3, -0.05]} scale={0.45} driftPhase={2.1} />
      <Envelope position={[-3.8, -2.0, -6]} rotation={[-0.2, 0.3, 0.05]} scale={0.5} driftPhase={3.4} />
    </>
  );
}

function FlyingPlane() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.15;
    const radius = 6;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius - 4;
    ref.current.position.y = Math.sin(t * 2) * 0.6 + 0.5;
    ref.current.rotation.y = -t + Math.PI / 2;
    ref.current.rotation.z = Math.sin(t * 2) * 0.18;
  });
  return (
    <group ref={ref}>
      <PaperPlane scale={0.45} color="#efeee7" edgeColor="#1a1a1c" bobSpeed={0} bobAmount={0} yawSpeed={0} rollAmount={0} />
    </group>
  );
}

export default function Background3D({ variant = "landing" }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const isLanding = variant !== "automation";
  return (
    <div className="bg-scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.4]}
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 4]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-6, -3, 2]} intensity={0.6} color="#a8a39a" />
        {isLanding && <Drifters />}
        {isLanding && <FlyingPlane />}
        <Dust
          count={isLanding ? 700 : 380}
          spread={[20, 12, 12]}
          color="#cfcec8"
          opacity={isLanding ? 0.4 : 0.28}
          size={0.018}
          speed={0.012}
        />
      </Canvas>
      <div className="bg-vignette" />
      <div className="bg-grid" />
    </div>
  );
}
