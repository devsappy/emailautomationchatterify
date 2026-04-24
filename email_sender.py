import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
import logging
from typing import List, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class HostingerEmailSender:
    """
    Email automation client for Hostinger mail.
    Uses Hostinger's SMTP server to send emails.
    """

    def __init__(
        self,
        email: str,
        password: str,
        smtp_server: str = "smtp.hostinger.com",
        smtp_port: int = 587,
        use_tls: bool = True
    ):
        """
        Initialize the email sender.

        Args:
            email: Your Hostinger email address (e.g., you@yourdomain.com)
            password: Your Hostinger email password or app password
            smtp_server: SMTP server address (default: smtp.hostinger.com)
            smtp_port: SMTP port (default: 587 for TLS)
            use_tls: Whether to use TLS encryption (default: True)
        """
        self.email = email
        self.password = password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.use_tls = use_tls

    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
        attachments: Optional[List[str]] = None,
        reply_to: Optional[str] = None
    ) -> bool:
        """
        Send an email via Hostinger SMTP.

        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            body_text: Plain text body content
            body_html: Optional HTML body content
            cc_emails: Optional list of CC recipients
            bcc_emails: Optional list of BCC recipients
            attachments: Optional list of file paths to attach
            reply_to: Optional reply-to email address

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.email
            msg["To"] = ", ".join(to_emails)

            if cc_emails:
                msg["Cc"] = ", ".join(cc_emails)
            if reply_to:
                msg["Reply-To"] = reply_to

            # Attach text body
            msg.attach(MIMEText(body_text, "plain"))

            # Attach HTML body if provided
            if body_html:
                msg.attach(MIMEText(body_html, "html"))

            # Handle attachments
            if attachments:
                for file_path in attachments:
                    if os.path.exists(file_path):
                        self._attach_file(msg, file_path)
                    else:
                        logger.warning(f"Attachment not found: {file_path}")

            # Build recipient list
            all_recipients = to_emails.copy()
            if cc_emails:
                all_recipients.extend(cc_emails)
            if bcc_emails:
                all_recipients.extend(bcc_emails)

            # Connect and send
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls(context=context)
                server.login(self.email, self.password)
                server.sendmail(self.email, all_recipients, msg.as_string())

            logger.info(f"Email sent successfully to {', '.join(to_emails)}")
            return True

        except smtplib.SMTPAuthenticationError:
            logger.error("Authentication failed. Check your email and password.")
            return False
        except smtplib.SMTPRecipientsRefused:
            logger.error("All recipients were refused.")
            return False
        except smtplib.SMTPSenderRefused:
            logger.error("Sender address refused.")
            return False
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    def _attach_file(self, msg: MIMEMultipart, file_path: str):
        """Attach a file to the email message."""
        filename = os.path.basename(file_path)
        
        with open(file_path, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
        
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {filename}",
        )
        msg.attach(part)

    def send_to_multiple(
        self,
        email_list: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        attachments: Optional[List[str]] = None,
        delay: float = 1.0
    ) -> dict:
        """
        Send the same email to multiple recipients one by one.

        Args:
            email_list: List of email addresses (e.g., ["a@x.com", "b@x.com"])
            subject: Email subject
            body_text: Plain text body content
            body_html: Optional HTML body content
            attachments: Optional list of file paths to attach
            delay: Seconds to wait between emails (default: 1.0)

        Returns:
            dict: Summary with 'sent', 'failed', and 'errors'
        """
        import time

        results = {"sent": 0, "failed": 0, "errors": []}
        total = len(email_list)

        for idx, email in enumerate(email_list, start=1):
            logger.info(f"[{idx}/{total}] Sending to: {email}")

            success = self.send_email(
                to_emails=[email],
                subject=subject,
                body_text=body_text,
                body_html=body_html,
                attachments=attachments
            )

            if success:
                results["sent"] += 1
            else:
                results["failed"] += 1
                results["errors"].append(email)

            if delay > 0 and idx < total:
                time.sleep(delay)

        logger.info(f"Batch complete: {results['sent']}/{total} sent, {results['failed']} failed")
        return results

    def send_bulk(
        self,
        recipients: List[dict],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        delay: float = 1.0
    ) -> dict:
        """
        Send personalized emails to multiple recipients individually.

        Args:
            recipients: List of dicts with 'email' key and optional 'name' key
            subject: Email subject
            body_text: Plain text template (use {name} for personalization)
            body_html: Optional HTML template (use {name} for personalization)
            delay: Seconds to wait between emails (default: 1.0)

        Returns:
            dict: Summary with 'sent', 'failed', and 'errors'
        """
        import time

        results = {"sent": 0, "failed": 0, "errors": []}

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("name", "")

            text = body_text.format(name=name, email=email)
            html = body_html.format(name=name, email=email) if body_html else None

            success = self.send_email(
                to_emails=[email],
                subject=subject,
                body_text=text,
                body_html=html
            )

            if success:
                results["sent"] += 1
            else:
                results["failed"] += 1
                results["errors"].append(email)

            if delay > 0:
                time.sleep(delay)

        logger.info(f"Bulk send complete: {results['sent']} sent, {results['failed']} failed")
        return results
