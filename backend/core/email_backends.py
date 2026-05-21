import json
import urllib.request
import urllib.error
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import re

class BrevoEmailBackend(BaseEmailBackend):
    """
    Custom Email Backend that sends emails through Brevo's HTTP API (v3)
    bypassing traditional SMTP to avoid firewall port blocking (like in Render Free Tier).
    """
    def send_messages(self, email_messages):
        if not email_messages:
            return 0
            
        api_key = getattr(settings, 'BREVO_API_KEY', None)
        if not api_key:
            print("No BREVO_API_KEY found, returning 0")
            return 0

        num_sent = 0
        for message in email_messages:
            html_content = None
            if hasattr(message, 'alternatives') and message.alternatives:
                html_content = message.alternatives[0][0]
                
            # Extract email from "Name <email@example.com>" if formatted that way
            from_email_raw = message.from_email or getattr(settings, 'DEFAULT_FROM_EMAIL')
            from_email = from_email_raw
            sender_name = "EduFinanzas"
            
            match = re.match(r"(.*)\s*<(.*)>", str(from_email_raw))
            if match:
                sender_name = match.group(1).strip()
                from_email = match.group(2).strip()

            payload = {
                "sender": {
                    "name": sender_name,
                    "email": from_email
                },
                "to": [{"email": email} for email in message.to],
                "subject": message.subject,
                "htmlContent": html_content if html_content else message.body.replace('\n', '<br>'),
                "textContent": message.body,
            }
            
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=data,
                headers={
                    "accept": "application/json",
                    "api-key": api_key,
                    "content-type": "application/json"
                },
                method="POST"
            )
            
            try:
                with urllib.request.urlopen(req, timeout=15) as response:
                    if response.status in (200, 201, 202):
                        num_sent += 1
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                print(f"Brevo API Error ({e.code}): {error_body}")
                if not self.fail_silently:
                    raise Exception(f"Brevo API Error: {error_body}")
            except Exception as e:
                print(f"Failed to send email via Brevo: {str(e)}")
                if not self.fail_silently:
                    raise e
                    
        return num_sent
