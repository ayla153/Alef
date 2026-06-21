import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def send_otp_email(to_email: str, otp_code: str, purpose_label: str) -> None:
    subject = f"Alef — your {purpose_label} code"
    body = (
        f"Your Alef verification code is: {otp_code}\n\n"
        f"This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
        "If you did not request this, you can ignore this email."
    )

    if settings.EMAIL_DEV_LOG_OTP or not _smtp_configured():
        logger.warning(
            "OTP email for %s (%s): %s",
            to_email,
            purpose_label,
            otp_code,
        )
        if not _smtp_configured():
            return

    message = MIMEMultipart()
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
    except smtplib.SMTPException as exc:
        raise EmailDeliveryError("Failed to send verification email") from exc
