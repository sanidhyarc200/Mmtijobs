"""
Outbound email notifications.

Uses whatever SMTP backend settings.py configured (Brevo in production,
console backend locally when no SMTP key is set). All sends are
best-effort: a mail failure must never break a sync request.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

from .models import Job, Person

logger = logging.getLogger(__name__)


def _find_job(job_client_id):
    return Job.objects.filter(client_id=job_client_id).first()


def _find_person(user_client_id):
    return Person.objects.filter(client_id=user_client_id).first()


def send_application_notification(app_record):
    """Email the company when a new application arrives for their job."""
    job = _find_job(app_record.get("jobId"))
    if job is None:
        return
    company_email = (job.data.get("companyEmail") or "").strip()
    if not company_email:
        logger.info("No companyEmail on job %s; skipping notification", job.client_id)
        return

    applicant = _find_person(app_record.get("userId"))
    applicant_data = applicant.data if applicant else {}
    applicant_name = applicant_data.get("name") or "A candidate"
    applicant_email = applicant_data.get("email") or "not provided"
    applicant_contact = applicant_data.get("contact") or "not provided"

    job_title = job.title or app_record.get("jobTitle") or "your job posting"

    subject = f"New application: {job_title}"
    body = (
        f"Hello {job.company_name or 'there'},\n\n"
        f"{applicant_name} has applied for \"{job_title}\" on MMTI Jobs.\n\n"
        f"Applicant details:\n"
        f"  Name: {applicant_name}\n"
        f"  Email: {applicant_email}\n"
        f"  Contact: {applicant_contact}\n\n"
        f"Log in to your company dashboard to review the application:\n"
        f"https://www.mmtijobs.com\n\n"
        f"— MMTI Jobs"
    )

    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [company_email],
            fail_silently=False,
        )
        logger.info("Application notification sent to %s for job %s", company_email, job.client_id)
    except Exception:
        logger.exception("Failed to send application notification to %s", company_email)
