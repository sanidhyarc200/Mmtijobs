"""
One-time migration: legacy localStorage-mirror collections (core app)
-> relational v2 models (domain app), hashing every plaintext password.

Safe to re-run: matches by email/client_id and only creates what's missing.

Also seeds the four staff accounts (all owned by the site admin; the HR
roles use Gmail plus-addresses of the same inbox). Passwords come from
env: STAFF_SHARED_PASSWORD for all of them, or the per-role vars
STAFF_ADMIN_PASSWORD / STAFF_HR_PASSWORD / STAFF_HR_MANAGER_PASSWORD /
STAFF_HR_RECRUITER_PASSWORD to override individually. Accounts are
skipped while no password is configured.
"""

import os

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_date

from core.models import Company as LegacyCompany
from core.models import Job as LegacyJob
from core.models import Person as LegacyPerson
from core.models import Application as LegacyApplication
from domain.models import Account, CompanyProfile, JobApplication, JobPost

STAFF_ACCOUNTS = [
    ("admin", "sanidhyakoranne123@gmail.com", "Administrator", "STAFF_ADMIN_PASSWORD"),
    ("hr", "sanidhyakoranne123+hr@gmail.com", "HR", "STAFF_HR_PASSWORD"),
    ("hr_manager", "sanidhyakoranne123+hrmanager@gmail.com", "HR Manager", "STAFF_HR_MANAGER_PASSWORD"),
    ("hr_recruiter", "sanidhyakoranne123+hrrecruiter@gmail.com", "HR Recruiter", "STAFF_HR_RECRUITER_PASSWORD"),
]


class Command(BaseCommand):
    help = "Migrate legacy sync collections into the relational v2 models."

    @transaction.atomic
    def handle(self, *args, **options):
        created = {"accounts": 0, "companies": 0, "jobs": 0, "applications": 0, "staff": 0}

        # ---- Accounts from legacy users ----
        for person in LegacyPerson.objects.all():
            data = person.data
            email = (data.get("email") or "").strip().lower()
            password = data.get("password") or ""
            if not email or "@" not in email:
                continue
            if Account.objects.filter(email__iexact=email).exists():
                continue
            user_type = data.get("userType") or "applicant"
            if user_type not in dict(Account.ROLE_CHOICES):
                user_type = "applicant"
            profile = {
                k: v
                for k, v in data.items()
                if k not in {"email", "password", "confirmPassword", "id", "userType", "name", "contact"}
            }
            account = Account(
                client_id=data.get("id"),
                email=email,
                user_type=user_type,
                name=data.get("name")
                or " ".join(
                    p for p in [data.get("firstName"), data.get("lastName")] if p
                ),
                contact=str(data.get("contact") or ""),
                profile=profile,
            )
            account.set_password(password or os.urandom(8).hex())
            account.save()
            created["accounts"] += 1

        # ---- Companies ----
        for legacy in LegacyCompany.objects.all():
            data = legacy.data
            email = (data.get("email") or "").strip().lower()
            if not email or "@" not in email:
                continue
            if CompanyProfile.objects.filter(email__iexact=email).exists():
                continue
            owner = Account.objects.filter(email__iexact=email, user_type="recruiter").first()
            if owner is None and data.get("password"):
                owner = Account(
                    client_id=None,
                    email=email,
                    user_type="recruiter",
                    name=data.get("name") or "",
                    contact=str(data.get("contact") or ""),
                )
                owner.set_password(data["password"])
                owner.save()
                created["accounts"] += 1
            CompanyProfile.objects.create(
                client_id=data.get("id"),
                owner=owner,
                name=data.get("name") or email,
                email=email,
                contact=str(data.get("contact") or ""),
                street_address=data.get("streetAddress", ""),
                city=data.get("city", ""),
                state=data.get("state", ""),
                pincode=str(data.get("pincode") or ""),
                gst_number=(data.get("gstNumber") or "").upper(),
                industry_type=data.get("industryType", ""),
                number_of_employees=data.get("numberOfEmployees", ""),
                website=data.get("companyWebsite") or "",
                profile_pic=data.get("profilePic") or "",
            )
            created["companies"] += 1

        # ---- Jobs ----
        known_shape = {
            "id", "title", "company", "companyEmail", "location", "experience",
            "experienceRange", "salary", "qualification", "tags", "hiringProcess",
            "numberOfOpenings", "gender", "status", "activeUntil", "description",
            "createdAt", "seedPriority", "jobType", "postedBy",
        }
        for legacy in LegacyJob.objects.all():
            data = legacy.data
            cid = data.get("id")
            if not isinstance(cid, int):
                continue  # frontend-hardcoded demo entries (string ids) stay in code
            if JobPost.objects.filter(client_id=cid).exists():
                continue
            company_email = (data.get("companyEmail") or "").strip().lower()
            company = (
                CompanyProfile.objects.filter(email__iexact=company_email).first()
                if company_email
                else None
            ) or CompanyProfile.objects.filter(name=data.get("company", "")).first()
            posted_by = None
            if data.get("postedBy"):
                posted_by = Account.objects.filter(client_id=data["postedBy"]).first()
            extra = {k: v for k, v in data.items() if k not in known_shape}
            JobPost.objects.create(
                client_id=cid,
                company=company,
                posted_by=posted_by,
                title=data.get("title") or "Untitled",
                status=data.get("status") or "active",
                location=data.get("location", ""),
                salary=data.get("salary", ""),
                description=data.get("description", ""),
                job_type=data.get("jobType", ""),
                qualification=str(data.get("qualification") or ""),
                experience=data.get("experience") or data.get("experienceRange") or "",
                gender=data.get("gender") or "Any",
                number_of_openings=str(data.get("numberOfOpenings") or ""),
                tags=data.get("tags") or [],
                hiring_process=data.get("hiringProcess") or [],
                active_until=parse_date(str(data.get("activeUntil") or "")) or None,
                seed_priority=int(data.get("seedPriority") or 0),
                extra=extra,
            )
            created["jobs"] += 1

        # ---- Applications ----
        for legacy in LegacyApplication.objects.all():
            data = legacy.data
            job = JobPost.objects.filter(client_id=data.get("jobId")).first()
            applicant = Account.objects.filter(client_id=data.get("userId")).first()
            if job is None or applicant is None:
                continue
            _, was_created = JobApplication.objects.get_or_create(
                job=job,
                applicant=applicant,
                defaults={"status": data.get("status") or "Applied"},
            )
            if was_created:
                created["applications"] += 1

        # ---- Staff accounts (passwords from env, never hardcoded) ----
        shared_password = os.environ.get("STAFF_SHARED_PASSWORD", "")
        for role, email, name, env_var in STAFF_ACCOUNTS:
            password = os.environ.get(env_var) or shared_password
            if not password:
                continue
            account, was_created = Account.objects.get_or_create(
                email=email, defaults={"user_type": role, "name": name}
            )
            if was_created:
                account.set_password(password)
                account.save()
                created["staff"] += 1

        self.stdout.write(self.style.SUCCESS(f"Migration complete: {created}"))
