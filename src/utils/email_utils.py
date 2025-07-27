import logging
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
from config import config  # Import your configuration module


def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email using Gmail's SMTP server.
    Args:
        to_email (str): Recipient's email address.
        subject (str): Subject of the email.
        body (str): Body of the email (HTML or plain text).
    """
    try:
        # Gmail SMTP server configuration
        smtp_server = "smtp.hostinger.com"
        smtp_port = 465
        smtp_username = config.Config.SMTP_USERNAME  # Your Email address
        smtp_password = config.Config.SMTP_PASSWORD  # Your Email App Password

        # Create the email
        msg = MIMEMultipart()
        msg["From"] = smtp_username
        msg["To"] = to_email
        msg["Subject"] = subject
        print(f"body: {body}")
        # msg.attach(MIMEText(body, "html"))  # Use "plain" for plain text emails
        msg.attach("test tist")

        # Connect to the Email SMTP server and send the email
        
        # with smtplib.SMTP(smtp_server, smtp_port) as server:
        #     server.set_debuglevel(1)  # Enable debug output
        #     server.starttls()  # Upgrade the connection to secure
        #     server.login(smtp_username, smtp_password)
        #     server.sendmail(smtp_username, to_email, msg.as_string())
        #     print(f"Email sent to {to_email}")
        
        
    except Exception as e:
        # Log the full exception details
        logging.exception("An error occurred while sending the email.")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")