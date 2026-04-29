import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { Dust, Envelope, PaperPlane, SendArc } from "./scene/primitives.jsx";

function ParallaxRig({ children, strength = 0.25 }) {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    const x = state.pointer.x;
    const y = state.pointer.y;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x * strength,
      0.045,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -y * strength * 0.7,
      0.045,
    );
  });
  return <group ref={group}>{children}</group>;
}

function HeroPlane() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.8) * 0.18;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.18;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.25 + Math.PI * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.06;
  });
  return (
    <group ref={ref} position={[0, 0.1, 0]} scale={1.4}>
      <PaperPlane
        color="#f8f6ee"
        edgeColor="#191919"
        bobSpeed={0}
        bobAmount={0}
        yawSpeed={0}
        rollAmount={0}
      />
    </group>
  );
}

function OrbitingEnvelopes() {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.08;
  });
  return (
    <group ref={group}>
      <Envelope
        position={[2.4, 0.6, -1.2]}
        rotation={[0.2, -0.5, 0.05]}
        scale={0.55}
        driftPhase={0.4}
      />
      <Envelope
        position={[-2.6, -0.4, -0.6]}
        rotation={[-0.1, 0.6, -0.08]}
        scale={0.5}
        driftPhase={1.6}
      />
      <Envelope
        position={[0.4, 1.6, -2.6]}
        rotation={[0.15, 0.2, 0.0]}
        scale={0.42}
        driftPhase={2.7}
      />
      <Envelope
        position={[-1.6, -1.4, -2.0]}
        rotation={[-0.2, -0.3, 0.05]}
        scale={0.4}
        driftPhase={3.9}
      />
    </group>
  );
}

export default function HeroScene() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="hero-scene-fallback" aria-hidden="true">
        <div className="hero-scene-fallback-inner" />
      </div>
    );
  }
  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.7]}
        camera={{ position: [0, 0.4, 5.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <fog attach="fog" args={["#0b0b0d", 6, 14]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.1}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 2, 3]} intensity={0.7} color="#cfd0d4" />
        <pointLight position={[4, -2, 2]} intensity={0.4} color="#9a958c" />

        <ParallaxRig strength={0.22}>
          <OrbitingEnvelopes />
          <HeroPlane />
          <SendArc rotation={[0, Math.PI * 0.05, 0]} />
        </ParallaxRig>

        <Dust count={260} spread={[10, 6, 6]} color="#bcbab2" opacity={0.4} size={0.02} speed={0.018} />

        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.45}
          scale={9}
          blur={2.6}
          far={3}
          color="#000000"
        />
      </Canvas>
      <div className="hero-scene-glow" />
    </div>
  );
}
