import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Copy,
  Eraser,
  Eye,
  FileText,
  Image,
  ListChecks,
  Mail,
  MessageSquareText,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import "./styles.css";

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
  if (!bannerUrl.trim()) {
    return "";
  }

  return `<img src="${escapeHtml(bannerUrl.trim())}" alt="Email banner" style="display:block;width:100%;max-width:680px;height:auto;border-radius:12px;margin:0 0 24px 0;" />`;
}

function metricLabel(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function ReceiverLogGroup({ label, emails }) {
  return (
    <div className="log-group">
      <div className="log-group-header">
        <span>{label}</span>
        <strong>{emails.length}</strong>
      </div>
      {emails.length > 0 ? (
        <ul className="receiver-list">
          {emails.map((email) => (
            <li key={`${label}-${email}`}>{email}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-log">No {label.toLowerCase()} receivers added.</p>
      )}
    </div>
  );
}

function App() {
  const [config, setConfig] = useState({
    sender_email: "",
    smtp_server: "smtp.hostinger.com",
    smtp_port: 587,
    is_configured: false,
  });
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState("plain");
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
  const canSend = config.is_configured && recipients.length > 0 && hasSubject && hasBody && !isSending;

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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Mail size={22} />
          </div>
          <div>
            <p>Chatterify Mail</p>
            <h1>Email Automation</h1>
          </div>
        </div>

        <section className="connection-card" aria-label="SMTP status">
          <div className={`health ${config.is_configured ? "is-ready" : "is-missing"}`}>
            {config.is_configured ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{config.is_configured ? "Ready to send" : "Credentials missing"}</span>
          </div>

          <dl className="connection-list">
            <div>
              <dt><UserRound size={15} /> Sender</dt>
              <dd>{config.sender_email || "Not configured"}</dd>
            </div>
            <div>
              <dt><Server size={15} /> SMTP</dt>
              <dd>{config.smtp_server}:{config.smtp_port}</dd>
            </div>
            <div>
              <dt><ShieldCheck size={15} /> Security</dt>
              <dd>TLS delivery</dd>
            </div>
          </dl>
        </section>

        <section className="template-panel" aria-label="Quick templates">
          <div className="panel-heading">
            <Sparkles size={16} />
            <span>Templates</span>
          </div>
          <div className="template-list">
            {templates.map((template) => (
              <button type="button" key={template.name} onClick={() => applyTemplate(template)}>
                <FileText size={16} />
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="section-kicker">Compose workspace</p>
            <h2>Prepare and send outreach</h2>
          </div>
          <div className="metrics" aria-label="Email metrics">
            <div>
              <strong>{recipients.length}</strong>
              <span>{metricLabel(recipients.length, "To recipient", "To recipients")}</span>
            </div>
            <div>
              <strong>{totalRecipients}</strong>
              <span>Total contacts</span>
            </div>
            <div>
              <strong>{wordCount}</strong>
              <span>Words</span>
            </div>
          </div>
        </header>

        <form className="compose-grid" onSubmit={submitEmail}>
          <section className="editor-card" aria-label="Email editor">
            <div className="card-header">
              <div>
                <p>Message details</p>
                <h3>Recipient and content</h3>
              </div>
              <button type="button" className="icon-button" onClick={resetForm} title="Reset form">
                <Eraser size={18} />
              </button>
            </div>

            <div className="field-group">
              <label>
                <span>To</span>
                <textarea
                  id="toEmails"
                  name="to_emails"
                  rows="3"
                  placeholder="recipient@example.com, another@example.com"
                  value={form.to_emails}
                  onChange={updateField}
                  required
                />
              </label>
              <div className="chip-row" aria-label="Recipient preview">
                {recipients.slice(0, 7).map((email) => (
                  <span className="chip" key={email}>{email}</span>
                ))}
                {recipients.length > 7 && <span className="chip">+{recipients.length - 7} more</span>}
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

            <section className="banner-panel" aria-label="Mail banner image">
              <div className="banner-heading">
                <div>
                  <span>Banner picture</span>
                  <strong>Email header image</strong>
                </div>
                <Image size={18} />
              </div>
              <label>
                <span>Image URL</span>
                <input
                  name="banner_url"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={form.banner_url}
                  onChange={updateField}
                />
              </label>
              <div className="banner-presets" aria-label="Banner presets">
                {bannerPresets.map((banner) => (
                  <button
                    type="button"
                    key={banner.name}
                    onClick={() => setForm((current) => ({ ...current, banner_url: banner.url }))}
                  >
                    {banner.name}
                  </button>
                ))}
              </div>
            </section>

            <div className="editor-toolbar">
              <div className="segmented" role="tablist" aria-label="Message format">
                <button
                  type="button"
                  className={activeTab === "plain" ? "is-active" : ""}
                  onClick={() => setActiveTab("plain")}
                >
                  <MessageSquareText size={16} />
                  Plain
                </button>
                <button
                  type="button"
                  className={activeTab === "html" ? "is-active" : ""}
                  onClick={() => setActiveTab("html")}
                >
                  <Code2 size={16} />
                  HTML
                </button>
              </div>
              <button type="button" className="secondary-button" onClick={clearMessage}>
                <Copy size={16} />
                Clear body
              </button>
            </div>

            {activeTab === "plain" ? (
              <label className="message-field">
                <span>Plain text message</span>
                <textarea
                  name="body_text"
                  rows="13"
                  placeholder="Write your email here..."
                  value={form.body_text}
                  onChange={updateField}
                  required={!form.body_html.trim()}
                />
              </label>
            ) : (
              <label className="message-field">
                <span>HTML message</span>
                <textarea
                  name="body_html"
                  rows="13"
                  placeholder="<p>Write your HTML email here...</p>"
                  value={form.body_html}
                  onChange={updateField}
                />
              </label>
            )}
          </section>

          <aside className="side-stack">
            <section className="preview-card" aria-label="Email preview">
              <div className="card-header compact">
                <div>
                  <p>Live preview</p>
                  <h3>Inbox view</h3>
                </div>
                <Eye size={18} />
              </div>
              <div className="preview-meta">
                <span>To</span>
                <strong>{recipients[0] || "No recipient selected"}</strong>
              </div>
              {bannerUrl && (
                <img className="preview-banner" src={bannerUrl} alt="Email banner preview" />
              )}
              <div className="preview-subject">{form.subject.trim() || "No subject yet"}</div>
              {form.body_html.trim() ? (
                <div className="preview-body" dangerouslySetInnerHTML={{ __html: form.body_html }} />
              ) : (
                <div className="preview-body">{activeBody || "Your message preview will appear here."}</div>
              )}
            </section>

            <section className="checklist-card" aria-label="Send checklist">
              <div className="card-header compact">
                <div>
                  <p>Readiness</p>
                  <h3>Send checklist</h3>
                </div>
              </div>
              <ul className="checklist">
                <li className={config.is_configured ? "is-done" : ""}>
                  <CheckCircle2 size={16} />
                  SMTP credentials loaded
                </li>
                <li className={recipients.length > 0 ? "is-done" : ""}>
                  <CheckCircle2 size={16} />
                  At least one recipient
                </li>
                <li className={hasSubject ? "is-done" : ""}>
                  <CheckCircle2 size={16} />
                  Subject is filled
                </li>
                <li className={hasBody ? "is-done" : ""}>
                  <CheckCircle2 size={16} />
                  Message body is ready
                </li>
              </ul>
            </section>

            <section className="logs-card" aria-label="Receiver email logs">
              <div className="card-header compact">
                <div>
                  <p>LOGS</p>
                  <h3>Receiver emails</h3>
                </div>
                <ListChecks size={18} />
              </div>
              <div className="logs-summary">
                <strong>{totalRecipients}</strong>
                <span>{metricLabel(totalRecipients, "receiver listed", "receivers listed")}</span>
              </div>
              <ReceiverLogGroup label="To" emails={recipients} />
              <ReceiverLogGroup label="CC" emails={ccRecipients} />
              <ReceiverLogGroup label="BCC" emails={bccRecipients} />
            </section>
          </aside>

          <footer className="send-bar">
            <p className={`form-status ${status.type ? `is-${status.type}` : ""}`} role="status">
              {status.message || "Review the preview and checklist before sending."}
            </p>
            <button type="submit" className="primary-button" disabled={!canSend}>
              <Send size={18} />
              {isSending ? "Sending..." : "Send Email"}
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
