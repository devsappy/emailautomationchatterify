"""
Example usage of the Hostinger Email Automation.

Before running:
    Set your credentials as environment variables:
        HOSTINGER_EMAIL=you@yourdomain.com
        HOSTINGER_PASSWORD=yourpassword

Or pass them directly (not recommended for production).
"""

import os
from email_sender import HostingerEmailSender
from config import EmailConfig


def send_to_multiple_example():
    """
    Send the same email to a list of recipients one by one.
    Just provide an array of emails and it handles the rest.
    """
    config = EmailConfig.from_env()

    if not config.validate():
        print("Error: Please set HOSTINGER_EMAIL and HOSTINGER_PASSWORD environment variables.")
        return

    sender = HostingerEmailSender(
        email=config.HOSTINGER_EMAIL,
        password=config.HOSTINGER_PASSWORD
    )

    # Replace these placeholders with your recipients locally before running.
    emails = [
        "recipient1@example.com",
        "recipient2@example.com",
        "recipient3@example.com",
        # Add as many as you want
    ]

    subject = "Hello from Hostinger Email Automation!"
    body = """Hi there,

We are from chaatterify.in we want to build your website for 10000000$ plz respond1.

Best regards,
Your Name
"""

    # Sends one by one with a delay between each
    results = sender.send_to_multiple(
        email_list=emails,
        subject=subject,
        body_text=body,
        delay=1.5  # seconds between sends
    )

    print("\n=== RESULTS ===")
    print(f"Sent successfully: {results['sent']}")
    print(f"Failed: {results['failed']}")
    if results['errors']:
        print(f"Failed addresses: {', '.join(results['errors'])}")


def send_html_to_multiple_example():
    """Send an HTML email to a list of recipients one by one."""
    config = EmailConfig.from_env()

    if not config.validate():
        print("Error: Please set HOSTINGER_EMAIL and HOSTINGER_PASSWORD environment variables.")
        return

    sender = HostingerEmailSender(
        email=config.HOSTINGER_EMAIL,
        password=config.HOSTINGER_PASSWORD
    )

    emails = [
        "user1@example.com",
        "user2@example.com",
    ]

    html_body = """
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2c3e50;">Hello!</h2>
            <p>This is an <strong>HTML email</strong> sent via automation.</p>
            <p style="color: #7f8c8d;">Powered by Hostinger + Python.</p>
        </body>
    </html>
    """

    results = sender.send_to_multiple(
        email_list=emails,
        subject="HTML Email Test",
        body_text="This is the plain text version of the email.",
        body_html=html_body,
        delay=2.0
    )

    print(f"\nSent: {results['sent']} | Failed: {results['failed']}")


def send_with_attachments_to_multiple_example():
    """Send an email with attachments to a list of recipients one by one."""
    config = EmailConfig.from_env()

    if not config.validate():
        print("Error: Please set HOSTINGER_EMAIL and HOSTINGER_PASSWORD environment variables.")
        return

    sender = HostingerEmailSender(
        email=config.HOSTINGER_EMAIL,
        password=config.HOSTINGER_PASSWORD
    )

    emails = [
        "user1@example.com",
        "user2@example.com",
    ]

    results = sender.send_to_multiple(
        email_list=emails,
        subject="Email with Attachment",
        body_text="Please find the attached file.",
        attachments=["sample_file.pdf"],  # Update with your file path
        delay=2.0
    )

    print(f"\nSent: {results['sent']} | Failed: {results['failed']}")


if __name__ == "__main__":
    print("Hostinger Email Automation")
    print("==========================")
    print("1. Send to multiple emails (simple text)")
    print("2. Send HTML email to multiple emails")
    print("3. Send email with attachments to multiple emails")
    print()

    choice = input("Enter example number to run (1-3): ").strip()

    examples = {
        "1": send_to_multiple_example,
        "2": send_html_to_multiple_example,
        "3": send_with_attachments_to_multiple_example,
    }

    if choice in examples:
        examples[choice]()
    else:
        print("Invalid choice. Please run again and select 1-3.")
