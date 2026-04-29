import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Background3D from "./components/Background3D.jsx";

export default function App() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith("/automation");
  const variant = isStudio ? "automation" : "landing";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <>
      <Background3D variant={variant} />
      <div className="grain" aria-hidden="true" />
      {!isStudio && (
        <motion.div
          className="scroll-progress"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />
      )}
      <Outlet />
      {!isStudio && (
        <footer className="page-foot global-foot">
          <span>© Chatterify Mail Studio</span>
          <span>Built for sharp outbound — TLS encrypted, SMTP delivered.</span>
        </footer>
      )}
    </>
  );
}
