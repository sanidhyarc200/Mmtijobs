"""
Relational domain model for MMT Jobs (v2 API).

Mirrors the rules the React frontend actually enforces:
- accounts with roles (applicant / recruiter / admin / hr / hr_manager /
  hr_recruiter), passwords stored HASHED
- companies owned by a recruiter account
- jobs with a pending -> active/inactive approval lifecycle
- one application per (job, applicant)

`client_id` columns keep compatibility with ids the frontend generated
(Date.now()) so migrated data keeps working during the transition.
"""

import secrets

from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Account(models.Model):
    ROLE_CHOICES = [
        ("applicant", "Applicant"),
        ("recruiter", "Recruiter"),
        ("admin", "Admin"),
        ("hr", "HR"),
        ("hr_manager", "HR Manager"),
        ("hr_recruiter", "HR Recruiter"),
    ]

    client_id = models.BigIntegerField(null=True, blank=True, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=256)
    user_type = models.CharField(max_length=20, choices=ROLE_CHOICES)
    name = models.CharField(max_length=255, blank=True, default="")
    contact = models.CharField(max_length=20, blank=True, default="", db_index=True)
    # Applicant profile payload (degree, skills, cv, salary prefs, …) — kept
    # as JSON because the onboarding form evolves faster than a schema should.
    profile = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw):
        self.password_hash = make_password(raw)

    def check_password(self, raw):
        return check_password(raw, self.password_hash)

    def __str__(self):
        return f"{self.email} ({self.user_type})"


class AuthToken(models.Model):
    key = models.CharField(max_length=64, unique=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="tokens")
    created_at = models.DateTimeField(auto_now_add=True)
    # Set when an admin impersonates a company; lets the UI show a banner
    # and lets us audit which actions were taken on behalf of clients.
    impersonated_by = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    @classmethod
    def issue(cls, account, impersonated_by=None):
        return cls.objects.create(
            key=secrets.token_hex(32), account=account, impersonated_by=impersonated_by
        )

    def __str__(self):
        return f"token for {self.account.email}"


class CompanyProfile(models.Model):
    client_id = models.BigIntegerField(null=True, blank=True, unique=True)
    owner = models.OneToOneField(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name="company"
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    contact = models.CharField(max_length=20, blank=True, default="")
    street_address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=12, blank=True, default="")
    gst_number = models.CharField(max_length=20, blank=True, default="", db_index=True)
    industry_type = models.CharField(max_length=100, blank=True, default="")
    number_of_employees = models.CharField(max_length=50, blank=True, default="")
    website = models.URLField(blank=True, default="")
    profile_pic = models.TextField(blank=True, default="")  # data URI from the frontend
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "company profiles"

    def __str__(self):
        return self.name


class JobPost(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending approval"),
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    client_id = models.BigIntegerField(null=True, blank=True, unique=True)
    company = models.ForeignKey(
        CompanyProfile, on_delete=models.CASCADE, null=True, blank=True, related_name="jobs"
    )
    posted_by = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs_posted"
    )
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending", db_index=True)
    location = models.CharField(max_length=255, blank=True, default="")
    salary = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    job_type = models.CharField(max_length=50, blank=True, default="")
    qualification = models.CharField(max_length=255, blank=True, default="")
    experience = models.CharField(max_length=100, blank=True, default="")
    gender = models.CharField(max_length=20, blank=True, default="Any")
    number_of_openings = models.CharField(max_length=10, blank=True, default="")
    tags = models.JSONField(default=list, blank=True)
    hiring_process = models.JSONField(default=list, blank=True)
    active_until = models.DateField(null=True, blank=True)
    seed_priority = models.IntegerField(default=0)
    status_changed_at = models.DateTimeField(null=True, blank=True)
    # Fields the frontend writes that don't need indexing (cgpa,
    # passingYearRange, companyEmail, …) survive round-trips here.
    extra = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-seed_priority", "-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.company_id and self.company.name or '?'} [{self.status}]"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Shortlisted", "Shortlisted"),
        ("Rejected", "Rejected"),
        ("Hired", "Hired"),
    ]

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["job", "applicant"], name="unique_job_applicant")
        ]

    def __str__(self):
        return f"{self.applicant.email} -> {self.job.title} [{self.status}]"


class SavedJob(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["account", "job"], name="unique_saved_job")
        ]


class CustomListEntry(models.Model):
    LIST_CHOICES = [("jobTitles", "Job titles"), ("qualifications", "Qualifications")]

    list_name = models.CharField(max_length=30, choices=LIST_CHOICES)
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["list_name", "value"], name="unique_list_value")
        ]
        verbose_name_plural = "custom list entries"

    def __str__(self):
        return f"{self.list_name}: {self.value}"
