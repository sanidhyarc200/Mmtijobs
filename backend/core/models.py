"""
Server-side storage for the MMT Jobs frontend.

The React app was built against localStorage collections, so every record's
full JSON payload is kept verbatim in `data` (round-trip fidelity is what
keeps the frontend working). The extra columns are denormalized copies of
the fields worth indexing/browsing in the admin. `order_index` preserves
the array order the frontend saved.
"""

from django.db import models


class SyncedRecordModel(models.Model):
    order_index = models.IntegerField(default=0)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["order_index"]


class Person(SyncedRecordModel):
    """A record from the frontend's `users` collection (jobseekers + recruiters)."""

    client_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    user_type = models.CharField(max_length=64, blank=True, default="")
    email = models.CharField(max_length=254, blank=True, default="", db_index=True)
    name = models.CharField(max_length=255, blank=True, default="")

    class Meta(SyncedRecordModel.Meta):
        verbose_name = "user"

    def __str__(self):
        return f"{self.name or self.email or self.client_id} ({self.user_type})"


class Company(SyncedRecordModel):
    """A record from the frontend's `registeredCompanies` collection."""

    client_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255, blank=True, default="")
    email = models.CharField(max_length=254, blank=True, default="", db_index=True)

    class Meta(SyncedRecordModel.Meta):
        verbose_name_plural = "companies"

    def __str__(self):
        return self.name or self.email or str(self.client_id)


class Job(SyncedRecordModel):
    """A record from the frontend's `jobs` collection."""

    client_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    title = models.CharField(max_length=255, blank=True, default="")
    company_name = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=64, blank=True, default="")

    def __str__(self):
        return f"{self.title} @ {self.company_name}"


class Application(SyncedRecordModel):
    """A record from the frontend's `jobApplications` collection (keyed by jobId+userId)."""

    job_client_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    user_client_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=64, blank=True, default="")

    def __str__(self):
        return f"job={self.job_client_id} user={self.user_client_id} [{self.status}]"


class KeyValueEntry(models.Model):
    """
    Catch-all for the smaller localStorage keys that don't warrant their own
    table: registeredCompany, savedJobs, applicants, customJobTitles,
    customQualifications.
    """

    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "key-value entries"

    def __str__(self):
        return self.key
