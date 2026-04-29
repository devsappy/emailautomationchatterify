import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Copy,
  Eraser,
  Eye,
  FileText,
  Image as ImageIcon,
  ListChecks,
  MessageSquareText,
  Send,
  Server,
  ShieldCheck,
  Sparkles as SparkIcon,
  UserRound,
  Zap,
} from "lucide-react";
import TopNav from "../components/TopNav.jsx";

const emailSplitPattern = /[\s,;]+/;

const initialForm = {
  to_emails: "",
  subject: "",
  reply_to: "",
  cc_emails: "",
  bcc_emails: "",
  banner_url: "",
  body_text: "",
  body_html: "",
};

const bannerPresets = [
  {
    name: "Business",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Growth",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Workspace",
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  },
];

const templates = [
  {
    name: "Website pitch",
    subject: "Website improvement proposal",
    body_text:
      "Hi,\n\nI noticed a few opportunities to improve your website experience and conversion flow. We can help with a clean, fast, mobile-friendly site built around your business goals.\n\nWould you be open to a short call this week?\n\nBest regards,\nChatterify Team",
  },
  {
    name: "Follow-up",
    subject: "Following up",
    body_text:
      "Hi,\n\nJust following up on my previous message. Happy to share a quick plan for improving your online presence and lead capture.\n\nBest regards,\nChatterify Team",
  },
  {
    name: "HTML intro",
    subject: "A quick idea for your website",
    body_html:
      "<h2>Hello,</h2><p>We help businesses build fast, modern websites that are easy to manage and designed to convert visitors into leads.</p><p>Would you like a quick website review?</p><p>Best regards,<br>Chatterify Team</p>",
  },
];

const sideTabs = [
  { id: "preview", label: "Preview", Icon: Eye },
  { id: "checklist", label: "Checks", Icon: CheckCircle2 },
  { id: "logs", label: "Logs", Icon: ListChecks },
];

function parseEmails(value) {
  return value
    .split(emailSplitPattern)
    .map((email) => email.trim())
    .filter(Boolean);
}

function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, " ");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function textToHtml(value) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function buildBannerHtml(bannerUrl) {
  if (!bannerUrl.trim()) return "";
  return `<img src="${escapeHtml(bannerUrl.trim())}" alt="Email banner" style="display:block;width:100%;max-width:680px;height:auto;border-radius:12px;margin:0 0 24px 0;" />`;
}

function metricLabel(count, singular, plural) {
  return count === 1 ? singular : plural;
}

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

function ReceiverLogGroup({ label, emails }) {
  return (
    <div className="log-group">
      <div className="log-group-header">
        <span>{label}</span>
        <strong>{emails.length}</strong>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {emails.length > 0 ? (
          <motion.ul
            key="list"
            className="receiver-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {emails.map((email) => (
              <motion.li
                key={`${label}-${email}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {email}
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            key="empty"
            className="empty-log"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No {label.toLowerCase()} receivers added.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Automation() {
  const [config, setConfig] = useState({
    sender_email: "",
    smtp_server: "smtp.hostinger.com",
    smtp_port: 587,
    is_configured: false,
  });
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState("plain");
  const [activeSide, setActiveSide] = useState("preview");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSending, setIsSending] = useState(false);

  const recipients = useMemo(() => parseEmails(form.to_emails), [form.to_emails]);
  const ccRecipients = useMemo(() => parseEmails(form.cc_emails), [form.cc_emails]);
  const bccRecipients = useMemo(() => parseEmails(form.bcc_emails), [form.bcc_emails]);
  const totalRecipients = recipients.length + ccRecipients.length + bccRecipients.length;
  const activeBody = form.body_html.trim() || form.body_text.trim();
  const wordCount = countWords(form.body_text || stripHtml(form.body_html));
  const bannerUrl = form.banner_url.trim();
  const hasSubject = Boolean(form.subject.trim());
  const hasBody = Boolean(activeBody);
  const checklistDone =
    Number(config.is_configured) +
    Number(recipients.length > 0) +
    Number(hasSubject) +
    Number(hasBody);
  const canSend =
    config.is_configured && recipients.length > 0 && hasSubject && hasBody && !isSending;

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Could not load backend configuration.");
        }
        setConfig(await response.json());
      } catch (error) {
        setStatus({ message: error.message, type: "error" });
      }
    }
    loadConfig();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function clearMessage() {
    setForm((current) => ({ ...current, body_text: "", body_html: "" }));
    setStatus({ message: "", type: "" });
  }

  function resetForm() {
    setForm(initialForm);
    setActiveTab("plain");
    setStatus({ message: "", type: "" });
  }

  function applyTemplate(template) {
    setForm((current) => ({
      ...current,
      subject: template.subject,
      body_text: template.body_text || "",
      body_html: template.body_html || "",
    }));
    setActiveTab(template.body_html ? "html" : "plain");
    setStatus({ message: `${template.name} template loaded.`, type: "success" });
  }

  async function submitEmail(event) {
    event.preventDefault();
    setStatus({ message: "Sending email through Hostinger SMTP...", type: "" });
    setIsSending(true);
    try {
      const payload = { ...form };
      if (bannerUrl) {
        const messageHtml = form.body_html.trim() || textToHtml(form.body_text);
        payload.body_html = `${buildBannerHtml(bannerUrl)}${messageHtml}`;
      }
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Email could not be sent.");
      }
      setStatus({ message: result.message, type: "success" });
    } catch (error) {
      setStatus({ message: error.message, type: "error" });
    } finally {
      setIsSending(false);
    }
  }

  const statusBadge = (
    <motion.div
      className={`status-pill ${config.is_configured ? "is-ready" : "is-missing"}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
    >
      <span className="dot" />
      {config.is_configured ? "SMTP live" : "Awaiting credentials"}
    </motion.div>
  );

  return (
    <div className="page automation">
      <TopNav statusBadge={statusBadge} />

      <motion.section
        className="studio"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.aside className="rail" variants={fadeIn}>
          <div className="glass connection-card compact">
            <div className="card-eyebrow">
              <ShieldCheck size={13} />
              <span>Connection</span>
            </div>
            <div className={`health ${config.is_configured ? "is-ready" : "is-missing"}`}>
              {config.is_configured ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{config.is_configured ? "Ready to send" : "Credentials missing"}</span>
            </div>
            <dl className="connection-list">
              <div>
                <dt><UserRound size={13} /> Sender</dt>
                <dd>{config.sender_email || "Not configured"}</dd>
              </div>
              <div>
                <dt><Server size={13} /> SMTP</dt>
                <dd>{config.smtp_server}:{config.smtp_port}</dd>
              </div>
              <div>
                <dt><Zap size={13} /> Security</dt>
                <dd>STARTTLS · port secure</dd>
              </div>
            </dl>
          </div>

          <div className="glass template-panel compact">
            <div className="card-eyebrow">
              <SparkIcon size={13} />
              <span>Templates</span>
            </div>
            <div className="template-list">
              {templates.map((template) => (
                <motion.button
                  type="button"
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                >
                  <FileText size={14} />
                  <span>{template.name}</span>
                  <ArrowUpRight size={13} className="template-arrow" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass rail-meta">
            <div className="rail-meta-row">
              <span>Drafted</span>
              <strong>{wordCount}<span className="meta-suffix"> words</span></strong>
            </div>
            <div className="rail-meta-row">
              <span>Recipients</span>
              <strong>{totalRecipients}</strong>
            </div>
            <div className="rail-meta-row">
              <span>Checks</span>
              <strong>{checklistDone}<span className="meta-suffix">/4</span></strong>
            </div>
          </div>
        </motion.aside>

        <motion.form className="editor-stack" onSubmit={submitEmail} variants={fadeIn}>
          <section className="glass editor-card">
            <div className="card-header">
              <div>
                <p>Compose</p>
                <h3>Recipient & content</h3>
              </div>
              <motion.button
                type="button"
                className="icon-button"
                onClick={resetForm}
                title="Reset form"
                whileHover={{ rotate: -10, scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                <Eraser size={16} />
              </motion.button>
            </div>

            <div className="field-group">
              <label>
                <span>To</span>
                <textarea
                  id="toEmails"
                  name="to_emails"
                  rows="2"
                  placeholder="recipient@example.com, another@example.com"
                  value={form.to_emails}
                  onChange={updateField}
                  required
                />
              </label>
              <div className="chip-row" aria-label="Recipient preview">
                <AnimatePresence initial={false}>
                  {recipients.slice(0, 7).map((email) => (
                    <motion.span
                      className="chip"
                      key={email}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18 }}
                    >
                      {email}
                    </motion.span>
                  ))}
                  {recipients.length > 7 && (
                    <motion.span
                      className="chip is-muted"
                      key="overflow"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      +{recipients.length - 7} more
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="field-grid">
              <label>
                <span>Subject</span>
                <input
                  name="subject"
                  type="text"
                  placeholder="Quick update"
                  value={form.subject}
                  onChange={updateField}
                  required
                />
              </label>
              <label>
                <span>Reply-To</span>
                <input
                  name="reply_to"
                  type="email"
                  placeholder="reply@example.com"
                  value={form.reply_to}
                  onChange={updateField}
                />
              </label>
              <label>
                <span>CC</span>
                <input
                  name="cc_emails"
                  type="text"
                  placeholder="optional@example.com"
                  value={form.cc_emails}
                  onChange={updateField}
                />
              </label>
              <label>
                <span>BCC</span>
                <input
                  name="bcc_emails"
                  type="text"
                  placeholder="optional@example.com"
                  value={form.bcc_emails}
                  onChange={updateField}
                />
              </label>
            </div>

            <div className="banner-row" aria-label="Mail banner image">
              <ImageIcon size={14} />
              <input
                name="banner_url"
                type="url"
                placeholder="Optional banner image URL"
                value={form.banner_url}
                onChange={updateField}
              />
              <div className="banner-presets">
                {bannerPresets.map((banner) => (
                  <motion.button
                    type="button"
                    key={banner.name}
                    onClick={() =>
                      setForm((current) => ({ ...current, banner_url: banner.url }))
                    }
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {banner.name}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="editor-toolbar">
              <div className="segmented" role="tablist" aria-label="Message format">
                {["plain", "html"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? "is-active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {activeTab === tab && (
                      <motion.span
                        className="seg-pill"
                        layoutId="seg-pill"
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      />
                    )}
                    <span className="seg-label">
                      {tab === "plain" ? <MessageSquareText size={14} /> : <Code2 size={14} />}
                      {tab === "plain" ? "Plain" : "HTML"}
                    </span>
                  </button>
                ))}
              </div>
              <motion.button
                type="button"
                className="secondary-button"
                onClick={clearMessage}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Copy size={13} />
                Clear body
              </motion.button>
            </div>

            <div className="message-field-shell">
              <AnimatePresence mode="wait">
                {activeTab === "plain" ? (
                  <motion.label
                    key="plain"
                    className="message-field"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span>Plain text message</span>
                    <textarea
                      name="body_text"
                      placeholder="Write your email here..."
                      value={form.body_text}
                      onChange={updateField}
                      required={!form.body_html.trim()}
                    />
                  </motion.label>
                ) : (
                  <motion.label
                    key="html"
                    className="message-field"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span>HTML message</span>
                    <textarea
                      name="body_html"
                      placeholder="<p>Write your HTML email here...</p>"
                      value={form.body_html}
                      onChange={updateField}
                    />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>
          </section>

          <motion.footer className="glass send-bar" variants={fadeIn}>
            <AnimatePresence mode="wait">
              <motion.p
                key={status.message || "idle"}
                className={`form-status ${status.type ? `is-${status.type}` : ""}`}
                role="status"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {status.message || "Review the preview before sending."}
              </motion.p>
            </AnimatePresence>
            <motion.button
              type="submit"
              className="primary-button"
              disabled={!canSend}
              whileHover={canSend ? { y: -1 } : {}}
              whileTap={canSend ? { scale: 0.97 } : {}}
            >
              <Send size={15} />
              {isSending ? "Sending..." : "Send Email"}
            </motion.button>
          </motion.footer>
        </motion.form>

        <motion.aside className="glass side-stack-card" variants={fadeIn}>
          <div className="side-tabs" role="tablist" aria-label="Side panel">
            {sideTabs.map((tab) => {
              const isActive = activeSide === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`side-tab ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSide(tab.id)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="side-tab-pill"
                      className="side-tab-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <span className="side-tab-label">
                    <tab.Icon size={14} />
                    {tab.label}
                    {tab.id === "checklist" && (
                      <span className="side-tab-counter">{checklistDone}/4</span>
                    )}
                    {tab.id === "logs" && totalRecipients > 0 && (
                      <span className="side-tab-counter">{totalRecipients}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="side-tab-content">
            <AnimatePresence mode="wait">
              {activeSide === "preview" && (
                <motion.div
                  key="preview"
                  className="side-panel preview-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="preview-meta">
                    <span>To</span>
                    <strong>{recipients[0] || "No recipient selected"}</strong>
                  </div>
                  {bannerUrl && (
                    <motion.img
                      className="preview-banner"
                      src={bannerUrl}
                      alt="Email banner preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  <div className="preview-subject">
                    {form.subject.trim() || "No subject yet"}
                  </div>
                  {form.body_html.trim() ? (
                    <div
                      className="preview-body"
                      dangerouslySetInnerHTML={{ __html: form.body_html }}
                    />
                  ) : (
                    <div className="preview-body">
                      {activeBody || "Your message preview will appear here."}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSide === "checklist" && (
                <motion.div
                  key="checklist"
                  className="side-panel checklist-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="panel-summary">
                    <strong>{checklistDone}<span className="meta-suffix">/4</span></strong>
                    <span>{checklistDone === 4 ? "All checks passing" : "Items still pending"}</span>
                  </div>
                  <ul className="checklist">
                    {[
                      { ok: config.is_configured, label: "SMTP credentials loaded" },
                      { ok: recipients.length > 0, label: "At least one recipient" },
                      { ok: hasSubject, label: "Subject is filled" },
                      { ok: hasBody, label: "Message body is ready" },
                    ].map((item) => (
                      <motion.li
                        key={item.label}
                        className={item.ok ? "is-done" : ""}
                        animate={{ opacity: item.ok ? 1 : 0.6 }}
                      >
                        <CheckCircle2 size={14} />
                        {item.label}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeSide === "logs" && (
                <motion.div
                  key="logs"
                  className="side-panel logs-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="panel-summary">
                    <strong>{totalRecipients}</strong>
                    <span>{metricLabel(totalRecipients, "receiver listed", "receivers listed")}</span>
                  </div>
                  <ReceiverLogGroup label="To" emails={recipients} />
                  <ReceiverLogGroup label="CC" emails={ccRecipients} />
                  <ReceiverLogGroup label="BCC" emails={bccRecipients} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </motion.section>
    </div>
  );
}
