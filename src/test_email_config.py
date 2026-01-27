
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json

# Load configuration
with open("config/config.json", "r") as config_file:
    config = json.load(config_file)

# Email details
sender_email = config["SMTP_USERNAME"]
receiver_email = "krishnag0902@gmail.com"  # Replace with the recipient's email
subject = "Test Email"
body = "This is a test email to verify SMTP configuration."

# Create the email
msg = MIMEMultipart()
msg["From"] = sender_email
msg["To"] = receiver_email
msg["Subject"] = subject
msg.attach(MIMEText(body, "plain"))

# Send the email
try:
    with smtplib.SMTP_SSL(config["SMTP_SERVER"], config["SMTP_PORT"]) as server:
        server.login(config["SMTP_USERNAME"], config["SMTP_PASSWORD"])
        server.sendmail(sender_email, receiver_email, msg.as_string())
        print("Test email sent successfully!")
except Exception as e:
    print(f"Failed to send test email: {e}")