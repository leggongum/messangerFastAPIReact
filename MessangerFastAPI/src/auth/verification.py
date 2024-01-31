import smtplib
from email.message import EmailMessage

from config import get_settings

settings = get_settings()


def get_email_verify_code_template(user_email: str, token: str) -> EmailMessage:
    email = EmailMessage()
    email['Subject'] = 'Verification token'
    email['From'] = settings.SMTP_USER
    email['To'] = user_email

    email.set_content(
        f'''
        <div style="background: linear-gradient(to bottom, rgb(46, 114, 75), rgb(24, 26, 25));height: 70vh;font-family: 'Optima', sans-serif;">
            <div style="width: 100%;height: 100%;">
                <h1 style="color:white;text-align: center;padding:10px;">Verification token. You know how use it.</h1>
                <div style="color:white;padding:10px;">
                    {token}
                </div>
            </div>
        </div>
        ''',
        subtype='html'
    )
    return email


def send_email_verification(user_email, token) -> None:
    email = get_email_verify_code_template(user_email, token)
    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(email)
