"""
Email utilities for transactional emails (signup, password reset, sign-in links).
Uses SMTP (config via SMTP_* env vars). Fails gracefully if not configured.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config.config import config

logger = logging.getLogger(__name__)


def is_email_configured() -> bool:
    """Return True if SMTP credentials are set and email can be sent."""
    return bool(config.SMTP_USERNAME and config.SMTP_PASSWORD)


def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Send an email via SMTP. Raises on failure.
    Use send_email_safe() from HTTP handlers if you don't want to fail the request.
    """
    if not is_email_configured():
        raise ValueError(
            "SMTP not configured. Set SMTP_USERNAME and SMTP_PASSWORD (and optionally "
            "SMTP_SERVER, SMTP_PORT) in your environment."
        )
    smtp_server = config.SMTP_SERVER
    smtp_port = config.SMTP_PORT
    smtp_username = config.SMTP_USERNAME
    smtp_password = config.SMTP_PASSWORD

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())
    else:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_email, msg.as_string())

    logger.info("Email sent successfully to %s", to_email)


def send_email_safe(to_email: str, subject: str, body: str) -> None:
    """
    Send an email. Never raises. Logs and returns if unconfigured or on error.
    Use this from auth flows so failed email doesn't break the API response.
    """
    if not is_email_configured():
        logger.warning(
            "Email skipped (SMTP not configured): would have sent '%s' to %s",
            subject,
            to_email,
        )
        return
    try:
        send_email(to_email, subject, body)
    except Exception as e:
        logger.exception("Failed to send email to %s: %s", to_email, e)


# --- HTML templates for auth emails -------------------------------------------


def _html_email(title: str, greeting: str, body_lines: list[str], cta_text: str, cta_url: str) -> str:
    """Simple HTML email with a primary CTA button."""
    lines = f"<p>{greeting}</p>\n  " + "\n  ".join(f"<p>{line}</p>" for line in body_lines)
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>{title}</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
  <h2 style="margin-bottom: 1em;">{title}</h2>
  {lines}
  <p style="margin-top: 1.5em;">
    <a href="{cta_url}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">{cta_text}</a>
  </p>
  <p style="margin-top: 1.5em; font-size: 0.9em; color: #666;">
    If the button doesn't work, copy and paste this link into your browser:<br>
    <a href="{cta_url}">{cta_url}</a>
  </p>
</body>
</html>
"""


def send_signup_link_email(to_email: str, signup_link: str) -> None:
    """Send 'Complete your signup' email with the signup link."""
    body = _html_email(
        title="Complete your signup",
        greeting=f"Hi,",
        body_lines=[
            "You've been added to Uniplexa. Click the button below to set your password and finish signing up.",
            "This link expires in 30 minutes.",
        ],
        cta_text="Complete signup",
        cta_url=signup_link,
    )
    send_email_safe(to_email, "Complete your Uniplexa signup", body)


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Send 'Reset your password' email with the reset link."""
    body = _html_email(
        title="Reset your password",
        greeting=f"Hi,",
        body_lines=[
            "We received a request to reset your Uniplexa password. Click the button below to choose a new password.",
            "This link expires in 15 minutes. If you didn't request this, you can ignore this email.",
        ],
        cta_text="Reset password",
        cta_url=reset_link,
    )
    send_email_safe(to_email, "Reset your Uniplexa password", body)


def send_signin_link_email(to_email: str, signin_link: str) -> None:
    """Send 'Sign in to Uniplexa' email with the one-time sign-in link."""
    body = _html_email(
        title="Sign in to Uniplexa",
        greeting=f"Hi,",
        body_lines=[
            "Use the button below to sign in to your Uniplexa account. No password needed.",
            "This link expires in 15 minutes. If you didn't request this, you can ignore this email.",
        ],
        cta_text="Sign in",
        cta_url=signin_link,
    )
    send_email_safe(to_email, "Sign in to Uniplexa", body)
