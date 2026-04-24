# Hostinger Email Automation

A simple Python automation for sending emails via Hostinger's SMTP server.

## Features

- Send plain text and HTML emails
- Attach files
- CC and BCC support
- Bulk personalized email sending
- Environment-based configuration

## Setup

1. **Clone or copy** this folder to your project.

2. **Set your credentials** using one of these methods:

### Option A: Environment Variables (Recommended)

```bash
# Windows PowerShell
$env:HOSTINGER_EMAIL="you@yourdomain.com"
$env:HOSTINGER_PASSWORD="yourpassword"

# Windows Command Prompt
set HOSTINGER_EMAIL=you@yourdomain.com
set HOSTINGER_PASSWORD=yourpassword
```

### Option B: .env File

Copy `.env.example` to `.env` and fill in your details:

```bash
cp .env.example .env
```

*(Note: You will need `python-dotenv` installed to load .env files automatically. You can add that to requirements.txt if needed.)*

## Usage

### Run the example script

```bash
python send_email.py
```

Then choose an example (1-5) to see it in action.

### Use in your own code

```python
from email_sender import HostingerEmailSender
from config import EmailConfig

config = EmailConfig.from_env()

sender = HostingerEmailSender(
    email=config.HOSTINGER_EMAIL,
    password=config.HOSTINGER_PASSWORD
)

sender.send_email(
    to_emails=["recipient@example.com"],
    subject="Hello!",
    body_text="This is a test email."
)
```

## Hostinger SMTP Settings

| Setting       | Value                 |
|---------------|-----------------------|
| SMTP Server   | `smtp.hostinger.com`  |
| Port          | `587` (TLS)           |
| Username      | Your full email       |
| Password      | Your email password   |

If you have issues, try port `465` with SSL instead of TLS.

## File Structure

| File               | Description                          |
|--------------------|--------------------------------------|
| `email_sender.py`  | Main email sending class             |
| `config.py`        | Configuration management             |
| `send_email.py`    | Example usage script                 |
| `.env.example`     | Example environment variables file   |
| `requirements.txt` | Python dependencies                  |

## Troubleshooting

- **Authentication failed?** Double-check your email and password. If you have 2FA enabled, use an app-specific password.
- **Connection refused?** Make sure your Hostinger email plan is active and SMTP access is enabled.
- **Emails going to spam?** Ensure your domain has proper SPF, DKIM, and DMARC records set up in Hostinger.
