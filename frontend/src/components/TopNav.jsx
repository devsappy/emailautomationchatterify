import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/automation", label: "Automation" },
  { to: "/#features", label: "Features", anchor: true },
  { to: "/#how", label: "How it works", anchor: true },
];

export default function TopNav({ statusBadge = null }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (statusBadge !== null) return;
    let cancelled = false;
    fetch("/api/config")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      });
    return () => {
      cancelled = true;
    };
  }, [statusBadge]);

  const isReady = config?.is_configured;

  return (
    <motion.nav
      className="topnav"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/" className="brand">
        <motion.div
          className="brand-mark"
          whileHover={{ rotate: 8, scale: 1.06 }}
          transition={{ type: "spring", stiffness: 280, damping: 14 }}
        >
          <img src="/chatterify.jpg" alt="Chatterify" className="brand-logo" />
        </motion.div>
        <div className="brand-text">
          <span className="brand-eyebrow">Chatterify</span>
          <span className="brand-name">Mail Studio</span>
        </div>
      </Link>

      <div className="nav-pills" role="navigation">
        {links.map((link) =>
          link.anchor ? (
            <a key={link.to} href={link.to} className="pill">
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `pill ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ),
        )}
      </div>

      {statusBadge !== null ? (
        statusBadge
      ) : (
        <Link to="/automation" className="nav-cta">
          <span>Open studio</span>
          <ArrowUpRight size={14} />
        </Link>
      )}
    </motion.nav>
  );
}
