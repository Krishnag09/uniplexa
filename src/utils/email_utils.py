import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import HTTPException
from config import config  # Import your configuration module


def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email using SMTP server.
    Args:
        to_email (str): Recipient's email address.
        subject (str): Subject of the email.
        body (str): Body of the email (HTML or plain text).
    """
    try:
        # Get SMTP configuration from config (loaded from environment variables)
        smtp_server = config.SMTP_SERVER
        smtp_port = config.SMTP_PORT
        smtp_username = config.SMTP_USERNAME
        smtp_password = config.SMTP_PASSWORD
        
        # Validate that SMTP credentials are set
        if not smtp_username or not smtp_password:
            raise ValueError("SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.")

        # Create the email
        msg = MIMEMultipart()
        msg["From"] = smtp_username
        msg["To"] = to_email
        msg["Subject"] = subject
        
        # Attach the email body (HTML format)
        msg.attach(MIMEText(body, "html"))

        # Connect to the SMTP server and send the email
        # Use SSL for port 465, or STARTTLS for other ports
        if smtp_port == 465:
            # Use SMTP_SSL for port 465
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(smtp_username, smtp_password)
                server.sendmail(smtp_username, to_email, msg.as_string())
                print(f"Email sent successfully to {to_email}")
        else:
            # Use STARTTLS for other ports
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()  # Upgrade the connection to secure
                server.login(smtp_username, smtp_password)
                server.sendmail(smtp_username, to_email, msg.as_string())
                print(f"Email sent successfully to {to_email}")
        
        
    except Exception as e:
        # Log the full exception details
        logging.exception("An error occurred while sending the email.")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")