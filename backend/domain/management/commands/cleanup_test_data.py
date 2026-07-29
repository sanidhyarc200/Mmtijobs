"""
One-off: delete the diagnostic/test records left in production during
debugging. Idempotent — does nothing if they're already gone. Removed
from the build once it has run.
"""

from django.core.management.base import BaseCommand

from core.models import Company as LegacyCompany
from core.models import Person as LegacyPerson
from domain.models import Account, CompanyProfile

TEST_EMAILS = [
    "healthcheck_probe_1785068014@example.com",
    "testregco_probe@example.com",
    "sanidhya+aa@gmail.com",
]


class Command(BaseCommand):
    help = "Delete leftover test/probe records from the database."

    def handle(self, *args, **options):
        lowered = [e.lower() for e in TEST_EMAILS]
        removed = {}

        # v2 relational tables (what the admin dashboard reads)
        for label, qs in [
            ("companies", CompanyProfile.objects.filter(email__in=TEST_EMAILS)),
            ("accounts", Account.objects.filter(email__in=TEST_EMAILS)),
        ]:
            removed[label] = qs.count()
            qs.delete()

        # Legacy mirror tables — match on the email inside the JSON payload
        legacy_people = [
            p.id for p in LegacyPerson.objects.all()
            if (p.data.get("email") or "").lower() in lowered
        ]
        removed["legacy_people"] = len(legacy_people)
        LegacyPerson.objects.filter(id__in=legacy_people).delete()

        legacy_companies = [
            c.id for c in LegacyCompany.objects.all()
            if (c.data.get("email") or "").lower() in lowered
        ]
        removed["legacy_companies"] = len(legacy_companies)
        LegacyCompany.objects.filter(id__in=legacy_companies).delete()

        self.stdout.write(self.style.SUCCESS(f"cleanup_test_data removed: {removed}"))
