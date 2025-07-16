import smtplib
from email.message import EmailMessage

FROM = 'simontroup27@gmail.com'
APP_PASSWORD = 'xjww xtsz dckb adth'

def confirmationEmail(email, name):
    msg = EmailMessage()
    msg['Subject'] = f'Thank you for Joining Neura, {name}'
    msg['From'] = FROM
    msg['To'] = email
    msg.set_content('This is the body of the email.')   
    
    
    html = f'''
       <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Neura</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px; background-color: #f9fafb;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 16px; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); overflow: hidden; color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: white;">👾 Welcome to <span style="color: #e0e7ff;">Neura</span></h1>
              <p style="margin: 10px 0 0; font-size: 16px; color: #c7d2fe;">Your journey into smart automation begins now.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>{name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">
                Thank you for signing up with <strong>Neura</strong> — the intelligent platform for next-gen email campaigns.
              </p>
              <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.5;">
                  Your account is now active, and you’re just one click away from building your first automated journey.
                </p>
              </div>
              <p style="font-size: 16px; line-height: 1.6;">
                Click below to launch your dashboard and start creating:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="http://127.0.0.1:5000/dashboard"
                  style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; text-decoration: none; font-weight: bold; border-radius: 10px; box-shadow: 0 0 10px #6366f1;">
                  Open Dashboard 🚀
                </a>
              </div>

              <p style="font-size: 14px; color: #9ca3af; line-height: 1.5;">
                If you didn't sign up for Neura, please ignore this message or <a href="mailto:support@neura.ai" style="color: #8b5cf6; text-decoration: none;">contact support</a>.
              </p>
            </td>
          </tr>

          <!-- Features Callout -->
          <tr>
            <td style="padding: 20px 30px; background-color: #111827;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 15px; font-weight: bold; color: #60a5fa;">Why Neura?</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; color: #94a3b8; font-size: 14px; padding: 10px 0;">
                    🚀 AI-Driven Automation &nbsp;|&nbsp; 🔄 Seamless Scheduling &nbsp;|&nbsp; 📊 Smart Analytics
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              &copy; 2025 Neura Inc. All rights reserved.<br>
              <a href="http://127.0.0.1:5000/dashboard" style="color: #8b5cf6; text-decoration: none;">neura.ai</a> &nbsp;|&nbsp;
              <a href="mailto:support@neura.ai" style="color: #8b5cf6; text-decoration: none;">Support</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
 
    '''
    msg.add_alternative(html, subtype='html')
    
    
    sendEmail(msg, FROM, APP_PASSWORD)

def sendEmail(msg, email , app_password):
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(email, app_password)  # Use App Password, not your normal one
        smtp.send_message(msg)
        print('message sent')
        
def compose_and_send_email(email, password) :
  msg = EmailMessage()
  msg['Subject'] = f'Thank you for Joining Neura'
  msg['From'] = FROM
  msg['To'] = email
  msg.set_content('This is the body of the email.')   
        


import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_oauth2(to_emails, subject, from_email, access_token, body_html):
    if isinstance(to_emails, str):
        to_emails = [to_emails]

    # Create the MIME message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = "You"

    # Attach the HTML body
    html_part = MIMEText(body_html, "html")
    message.attach(html_part)

    # Build the OAuth2 string
    auth_string = f"user={from_email}\1auth=Bearer {access_token}\1\1"
    auth_bytes = auth_string.encode("utf-8")
    auth_encoded = base64.b64encode(auth_bytes).decode("utf-8")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.docmd("AUTH", "XOAUTH2 " + auth_encoded)
            response = server.sendmail(from_email, to_emails, message.as_string())  # real recipients
        print('email sent')
        print('response: ', response)
        return response
    except smtplib.SMTPAuthenticationError as e:
        print(" Authentication error:", e.smtp_error.decode())
        return False
    except Exception as e:
        print(" Failed to send email:", str(e))
        return False








