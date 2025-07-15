import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os
from dotenv import load_dotenv

load_dotenv()

def send_email(subject: str, body: str, to_email: str):
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    sender = {"name": "Findify Bot", "email": os.getenv("SEND_EMAIL")}
    to = [{"email": to_email}]

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        html_content=f"<html><body>{body}</body></html>"
    )

    try:
        api_response = api_instance.send_transac_email(email)
        print(f"Email sent: {api_response}")
    except ApiException as e:
        print(f"Error sending email: {e}")