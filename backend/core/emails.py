"""
Outbound email notifications, all wrapped in the MMTI Jobs brand template.

Uses whatever SMTP backend settings.py configured (Brevo in production,
console backend locally when no SMTP key is set). All sends are
best-effort: a mail failure must never break a sync request.
"""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from .models import Job, Person

logger = logging.getLogger(__name__)

SITE_URL = "https://www.mmtijobs.com"
BRAND_BLUE = "#0a66c2"
BRAND_GREEN = "#198754"


def _branded_html(title, intro, content_html, cta_label=None, cta_url=None):
    """Wrap content in the MMTI Jobs email shell (blue header, card, footer)."""
    cta = ""
    if cta_label and cta_url:
        cta = f"""
        <tr><td align="center" style="padding: 28px 0 8px;">
          <a href="{cta_url}" style="background: {BRAND_BLUE}; color: #ffffff;
             text-decoration: none; font-weight: 700; font-size: 16px;
             padding: 14px 36px; border-radius: 8px; display: inline-block;">
            {cta_label}
          </a>
        </td></tr>"""

    return f"""<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding: 24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background: linear-gradient(135deg, {BRAND_BLUE}, #084d92); padding: 28px 32px;">
            <div style="color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
              MMTI <span style="color:#9fd0ff;">Jobs</span>
            </div>
            <div style="color: #cfe6ff; font-size: 13px; margin-top: 4px;">
              Find your dream job &nbsp;|&nbsp; Find your dream employees
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <h1 style="margin: 0 0 12px; font-size: 22px; color: #111827;">{title}</h1>
            <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #374151;">{intro}</p>
            {content_html}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{cta}</table>
          </td>
        </tr>
        <tr>
          <td style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
              This email was sent by <a href="{SITE_URL}" style="color: {BRAND_BLUE}; text-decoration: none;">MMTI Jobs</a>, Bhopal.<br/>
              Questions? Reply to this email or call 9993826661 / 9516422456.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _send(subject, to_email, text_body, html_body):
    try:
        msg = EmailMultiAlternatives(
            subject, text_body, settings.DEFAULT_FROM_EMAIL, [to_email]
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        logger.info("Email '%s' sent to %s", subject, to_email)
        return True
    except Exception:
        logger.exception("Failed to send '%s' to %s", subject, to_email)
        return False


# ---------------------------------------------------------------------------
# Application notification
# ---------------------------------------------------------------------------

def send_application_notification(app_record):
    """Email the company when a new application arrives for their job."""
    job = Job.objects.filter(client_id=app_record.get("jobId")).first()
    if job is None:
        return
    company_email = (job.data.get("companyEmail") or "").strip()
    if not company_email:
        logger.info("No companyEmail on job %s; skipping notification", job.client_id)
        return

    applicant = Person.objects.filter(client_id=app_record.get("userId")).first()
    a = applicant.data if applicant else {}
    name = a.get("name") or f"{a.get('firstName', '')} {a.get('lastName', '')}".strip() or "A candidate"
    email = a.get("email") or "not provided"
    contact = a.get("contact") or a.get("phone") or "not provided"
    job_title = job.title or app_record.get("jobTitle") or "your job posting"

    subject = f"New application: {job_title}"
    text = (
        f"Hello {job.company_name or 'there'},\n\n"
        f"{name} has applied for \"{job_title}\" on MMTI Jobs.\n\n"
        f"Name: {name}\nEmail: {email}\nContact: {contact}\n\n"
        f"Review applications: {SITE_URL}\n\n— MMTI Jobs"
    )
    rows = "".join(
        f"<tr><td style='padding:8px 12px; color:#6b7280; font-size:14px;'>{k}</td>"
        f"<td style='padding:8px 12px; color:#111827; font-size:14px; font-weight:600;'>{v}</td></tr>"
        for k, v in [("Name", name), ("Email", email), ("Contact", contact)]
    )
    html = _branded_html(
        "You have a new applicant! 🎉",
        f"<strong>{name}</strong> has applied for <strong>“{job_title}”</strong>.",
        f"<table role='presentation' width='100%' style='background:#f8fafc; border-radius:10px;'>{rows}</table>",
        "Review Applications",
        SITE_URL,
    )
    _send(subject, company_email, text, html)


# ---------------------------------------------------------------------------
# Password reset
# ---------------------------------------------------------------------------

def send_password_reset_email(to_email, token):
    reset_url = f"{SITE_URL}/reset-password?token={token}"
    subject = "Reset your MMTI Jobs password"
    text = (
        f"We received a request to reset the password for {to_email}.\n\n"
        f"Open this link to set a new password (valid for 1 hour):\n{reset_url}\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n— MMTI Jobs"
    )
    html = _branded_html(
        "Reset your password",
        f"We received a request to reset the password for <strong>{to_email}</strong>. "
        "Click the button below to choose a new password. The link is valid for <strong>1 hour</strong>.",
        "<p style='font-size:13px; color:#6b7280;'>If you didn't request this, you can safely ignore this email — your password stays unchanged.</p>",
        "Set New Password",
        reset_url,
    )
    return _send(subject, to_email, text, html)


# ---------------------------------------------------------------------------
# Client onboarding credentials
# ---------------------------------------------------------------------------

def send_credentials_email(company_name, to_email, password):
    subject = "Welcome to MMTI Jobs — your company account is ready"
    text = (
        f"Hello {company_name},\n\n"
        f"Your company account on MMTI Jobs is ready. Your jobs are already live!\n\n"
        f"Login email: {to_email}\nTemporary password: {password}\n\n"
        f"IMPORTANT: please change this password right away.\n"
        f"1. Go to {SITE_URL}\n"
        f"2. Click Post a Job -> Yes, Log In -> Forgot password?\n"
        f"3. Enter your email and follow the reset link we send you.\n\n"
        f"— MMTI Jobs"
    )
    creds = f"""
      <table role='presentation' width='100%' style='background:#f8fafc; border:1px dashed {BRAND_BLUE}; border-radius:10px;'>
        <tr><td style='padding:10px 16px; color:#6b7280; font-size:14px; width:45%;'>Login email</td>
            <td style='padding:10px 16px; color:#111827; font-size:15px; font-weight:700;'>{to_email}</td></tr>
        <tr><td style='padding:10px 16px; color:#6b7280; font-size:14px;'>Temporary password</td>
            <td style='padding:10px 16px; color:#111827; font-size:15px; font-weight:700; font-family: monospace;'>{password}</td></tr>
      </table>
      <table role='presentation' width='100%' style='background:#fff7ed; border-radius:10px; margin-top:18px;'>
        <tr><td style='padding:14px 16px; font-size:14px; color:#9a3412; line-height:1.6;'>
          🔐 <strong>Please change this password immediately:</strong><br/>
          1. Open <a href='{SITE_URL}' style='color:{BRAND_BLUE};'>mmtijobs.com</a> and click
             <strong>Post a Job → Yes, Log In → Forgot password?</strong><br/>
          2. Enter your email — we'll send you a secure link to set your own password.
        </td></tr>
      </table>
      <p style='font-size:14px; color:#374151; margin-top:18px;'>
        From your dashboard you can post new jobs, edit existing ones, and see every candidate
        who applies — you'll also get an email each time someone applies.
      </p>"""
    html = _branded_html(
        f"Welcome aboard, {company_name}! 🚀",
        "Your company account on <strong>MMTI Jobs</strong> is ready, and your job listings are already live.",
        creds,
        "Open Your Dashboard",
        SITE_URL,
    )
    return _send(subject, to_email, text, html)
