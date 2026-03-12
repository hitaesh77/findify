import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os
from dotenv import load_dotenv

load_dotenv()

def send_email(subject: str, body: str, to_email: str) -> bool:
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("SEND_EMAIL")
    
    if not api_key or not sender_email:
        print(".env didnt load")
        return False

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    sender = {"name": "Findify Bot", "email": sender_email}
    to = [{"email": to_email}]

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        html_content=f"<html><body>{body}</body></html>"
    )

    try:
        api_response = api_instance.send_transac_email(email)
        print(f"email sent to: {to_email}")
        return True
    except ApiException as e:
        print(f"error sending email: {e}")
        return False