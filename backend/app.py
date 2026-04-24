import re
from pathlib import Path
from typing import List

from flask import Flask, jsonify, request, send_from_directory

from config import EmailConfig
from email_sender import HostingerEmailSender


PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
FRONTEND_DIST_DIR = FRONTEND_DIR / "dist"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIST_DIR),
    static_url_path="",
)

EMAIL_SPLIT_PATTERN = re.compile(r"[\s,;]+")


def parse_email_list(value: str) -> List[str]:
    """Parse comma, semicolon, or newline separated email addresses."""
    return [email.strip() for email in EMAIL_SPLIT_PATTERN.split(value or "") if email.strip()]


@app.get("/api/config")
def get_config():
    config = EmailConfig.from_env()
    return jsonify({
        "sender_email": config.HOSTINGER_EMAIL,
        "smtp_server": config.SMTP_SERVER,
        "smtp_port": config.SMTP_PORT,
        "is_configured": config.validate(),
    })


@app.post("/api/send")
def send_email():
    config = EmailConfig.from_env()
    if not config.validate():
        return jsonify({
            "ok": False,
            "message": "HOSTINGER_EMAIL and HOSTINGER_PASSWORD are not configured.",
        }), 400

    data = request.get_json(silent=True) or {}
    to_emails = parse_email_list(data.get("to_emails", ""))
    cc_emails = parse_email_list(data.get("cc_emails", ""))
    bcc_emails = parse_email_list(data.get("bcc_emails", ""))
    subject = (data.get("subject") or "").strip()
    body_text = (data.get("body_text") or "").strip()
    body_html = (data.get("body_html") or "").strip() or None
    reply_to = (data.get("reply_to") or config.DEFAULT_REPLY_TO or "").strip() or None

    if not to_emails:
        return jsonify({"ok": False, "message": "Add at least one recipient."}), 400
    if not subject:
        return jsonify({"ok": False, "message": "Subject is required."}), 400
    if not body_text and not body_html:
        return jsonify({"ok": False, "message": "Message body is required."}), 400

    sender = HostingerEmailSender(
        email=config.HOSTINGER_EMAIL,
        password=config.HOSTINGER_PASSWORD,
        smtp_server=config.SMTP_SERVER,
        smtp_port=config.SMTP_PORT,
        use_tls=config.USE_TLS,
    )

    success = sender.send_email(
        to_emails=to_emails,
        subject=subject,
        body_text=body_text or "HTML email attached.",
        body_html=body_html,
        cc_emails=cc_emails or None,
        bcc_emails=bcc_emails or None,
        reply_to=reply_to,
    )

    if not success:
        return jsonify({
            "ok": False,
            "message": "Email could not be sent. Check the server logs and SMTP credentials.",
        }), 502

    return jsonify({
        "ok": True,
        "message": f"Email sent to {len(to_emails)} recipient(s).",
    })


@app.get("/")
def index():
    if not (FRONTEND_DIST_DIR / "index.html").exists():
        return jsonify({
            "message": "React frontend is not built. Run npm run dev in frontend/ for development.",
        }), 404

    return send_from_directory(FRONTEND_DIST_DIR, "index.html")


@app.get("/<path:path>")
def serve_react_app(path: str):
    requested_path = FRONTEND_DIST_DIR / path
    if requested_path.exists() and requested_path.is_file():
        return send_from_directory(FRONTEND_DIST_DIR, path)
    if (FRONTEND_DIST_DIR / "index.html").exists():
        return send_from_directory(FRONTEND_DIST_DIR, "index.html")
    return jsonify({"message": "Frontend asset not found."}), 404


if __name__ == "__main__":
    app.run(debug=True)
