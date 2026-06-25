import os
import smtplib
from email.mime.text import MIMEText


def send_email(to: str, subject: str, body: str) -> None:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL")

    if not smtp_host or not smtp_from_email:
        raise RuntimeError("SMTP configuration is not complete. Set SMTP_HOST and SMTP_FROM_EMAIL.")

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_from_email
    msg["To"] = to

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        if smtp_user and smtp_password:
            server.login(smtp_user, smtp_password)
        server.send_message(msg)
