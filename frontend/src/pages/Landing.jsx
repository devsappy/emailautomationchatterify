import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Code2,
  Eye,
  Image as ImageIcon,
  ListChecks,
  Mail,
  Send,
  ShieldCheck,
  Sparkles as SparkIcon,
  Wand2,
  Zap,
} from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import HeroScene from "../components/HeroScene.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const features = [
  {
    icon: Wand2,
    title: "Composer with intent",
    body: "A focused editor that toggles between plain text and HTML, with monospace ergonomics for engineers and creatives alike.",
  },
  {
    icon: Eye,
    title: "Inbox-accurate preview",
    body: "Render exactly what your recipient will see — banner image, subject, and body — before a single byte leaves the wire.",
  },
  {
    icon: SparkIcon,
    title: "Reusable templates",
    body: "Drop in pitches, follow-ups, or full HTML in one click. Build a library that compounds with every campaign.",
  },
  {
    icon: ShieldCheck,
    title: "TLS-encrypted SMTP",
    body: "STARTTLS to Hostinger SMTP. Your credentials live server-side; nothing sensitive is exposed to the browser.",
  },
  {
    icon: ListChecks,
    title: "Live readiness checks",
    body: "An always-on send checklist tracks recipients, subject, body, and credentials so you never ship a half-baked message.",
  },
  {
    icon: ImageIcon,
    title: "Banner-ready emails",
    body: "Curated header presets and a URL field — hero imagery is auto-injected into the rendered HTML at send time.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect SMTP",
    body: "Server-side credentials read from env at boot. The studio shows live status the moment you load it.",
  },
  {
    n: "02",
    title: "Compose & preview",
    body: "Type, paste a template, attach a banner. The preview pane mirrors the final inbox render in real time.",
  },
  {
    n: "03",
    title: "Send with confidence",
    body: "Hit send when the readiness checklist is green. Receivers, CC, and BCC are logged to the side panel.",
  },
];

const stats = [
  { value: "TLS", soft: "Encrypted by default" },
  { value: "0", soft: "Credentials in browser" },
  { value: "<1s", soft: "Preview-to-send roundtrip" },
  { value: "∞", soft: "Templates you can ship" },
];

function MagneticCTA({ to, children, className = "primary-button cta-primary" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  function handleMove(event) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * 0.18);
    y.set(offsetY * 0.18);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className="magnetic-wrap"
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

function CountUp({ to, suffix = "", duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());
  useEffect(() => {
    if (!inView) return;
    const controls = motionValue.set(0);
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      motionValue.set(eased * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, motionValue]);
  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function HeroStat({ value, soft }) {
  // Treat numeric strings as count-up; everything else stays literal.
  const numeric = typeof value === "string" && /^\d+$/.test(value);
  return (
    <div className="hero-stat">
      <strong>
        {numeric ? <CountUp to={parseInt(value, 10)} /> : value}
      </strong>
      <span>{soft}</span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="page landing">
      <TopNav />

      <motion.header className="hero" variants={stagger} initial="hidden" animate="show">
        <motion.span className="kicker" variants={fadeUp}>
          <span className="kicker-dot" /> The outbound studio
        </motion.span>
        <motion.h1 variants={fadeUp}>
          Outbound email,
          <br /> rendered <em>classy</em>.
        </motion.h1>
        <motion.p variants={fadeUp} className="hero-sub">
          Chatterify Mail Studio is a focused workspace to compose, preview, and dispatch
          high-signal email — wired to your own SMTP with live readiness checks, beautiful
          previews, and reusable templates.
        </motion.p>

        <motion.div variants={fadeUp} className="hero-cta">
          <MagneticCTA to="/automation">
            <Send size={16} />
            Open the studio
          </MagneticCTA>
          <a href="#features" className="ghost-button">
            See features <ArrowUpRight size={14} />
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="hero-meta">
          {stats.map((stat) => (
            <HeroStat key={stat.soft} value={stat.value} soft={stat.soft} />
          ))}
        </motion.div>
      </motion.header>

      <motion.section
        className="hero-scene-section"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroScene />
        <div className="hero-scene-caption">
          <span className="kicker"><span className="kicker-dot" /> The way it sends</span>
          <h3>One plane. One trail. Zero noise.</h3>
          <p>
            Every email that leaves the studio is composed, checked, and dispatched with
            the same care a paper plane gets in the hands of a careful sender.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="showcase"
        initial={{ opacity: 0, y: 32, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="showcase-frame glass">
          <div className="showcase-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="showcase-url">studio.chatterify.app/automation</span>
          </div>
          <div className="showcase-inner">
            <div className="showcase-side">
              <div className="showcase-eyebrow">Connection</div>
              <div className="showcase-pill is-ready">
                <span className="dot" /> SMTP live
              </div>
              <div className="showcase-eyebrow">Templates</div>
              <ul className="showcase-list">
                <li>Website pitch <ArrowUpRight size={12} /></li>
                <li>Follow-up <ArrowUpRight size={12} /></li>
                <li>HTML intro <ArrowUpRight size={12} /></li>
              </ul>
            </div>
            <div className="showcase-main">
              <div className="showcase-row">
                <span className="showcase-chip">amelia@acme.com</span>
                <span className="showcase-chip">team@acme.com</span>
                <span className="showcase-chip is-muted">+4</span>
              </div>
              <div className="showcase-subject">A quick idea for your website</div>
              <div className="showcase-body">
                <p>Hi Amelia,</p>
                <p>
                  We help teams ship faster, classier outbound — built around your tone, your
                  cadence, and your numbers.
                </p>
                <p>Open to a 15-min review this week?</p>
              </div>
              <div className="showcase-foot">
                <span>4/4 checks green</span>
                <span className="showcase-send">
                  <Send size={12} /> Send
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section id="features" className="section">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="kicker"><Zap size={13} /> Features</span>
          <h2>
            Everything you need to send <em>well</em>.
          </h2>
          <p>Built for operators who care about how their email looks the moment it lands.</p>
        </motion.div>

        <motion.div
          className="feature-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              className="feature-card glass"
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
            >
              <div className="feature-icon">
                <feature.icon size={18} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section id="how" className="section">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="kicker"><Code2 size={13} /> Workflow</span>
          <h2>
            Three steps. Then you’re <em>sending</em>.
          </h2>
          <p>From cold start to first dispatch in under a minute.</p>
        </motion.div>

        <motion.div
          className="steps"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.n}
              className="step-card glass"
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
            >
              <span className="step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.section
        className="cta-band glass"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <span className="kicker"><Mail size={13} /> Ready when you are</span>
          <h2>Open the studio. Ship something good.</h2>
          <p>Your SMTP is configured. Your templates are warm. The inbox is waiting.</p>
        </div>
        <MagneticCTA to="/automation">
          <Send size={16} />
          Launch the composer
        </MagneticCTA>
      </motion.section>
    </div>
  );
}
