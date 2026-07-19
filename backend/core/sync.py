"""
Mapping between frontend localStorage keys and server storage.

Collection keys (arrays of records) map to real tables; the rest live in
KeyValueEntry. `replace_collection` swaps a table's contents atomically with
the array the frontend sent, preserving order.
"""

from django.db import transaction

from .models import Application, Company, Job, KeyValueEntry, Person


def _application_key(record):
    return (record.get("jobId"), record.get("userId"))


def _int_or_none(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _person_row(record, index):
    return Person(
        order_index=index,
        data=record,
        client_id=_int_or_none(record.get("id")),
        user_type=str(record.get("userType") or "")[:64],
        email=str(record.get("email") or "")[:254],
        name=str(record.get("name") or "")[:255],
    )


def _company_row(record, index):
    return Company(
        order_index=index,
        data=record,
        client_id=_int_or_none(record.get("id")),
        name=str(record.get("name") or "")[:255],
        email=str(record.get("email") or "")[:254],
    )


def _job_row(record, index):
    return Job(
        order_index=index,
        data=record,
        client_id=_int_or_none(record.get("id")),
        title=str(record.get("title") or "")[:255],
        company_name=str(record.get("company") or "")[:255],
        status=str(record.get("status") or "")[:64],
    )


def _application_row(record, index):
    return Application(
        order_index=index,
        data=record,
        job_client_id=_int_or_none(record.get("jobId")),
        user_client_id=_int_or_none(record.get("userId")),
        status=str(record.get("status") or "")[:64],
    )


COLLECTIONS = {
    "users": (Person, _person_row),
    "registeredCompanies": (Company, _company_row),
    "jobs": (Job, _job_row),
    "jobApplications": (Application, _application_row),
}

KV_KEYS = {
    "registeredCompany",
    "savedJobs",
    "applicants",
    "customJobTitles",
    "customQualifications",
}

SYNCABLE_KEYS = set(COLLECTIONS) | KV_KEYS


def replace_collection(key, records):
    model, build_row = COLLECTIONS[key]
    if not isinstance(records, list):
        raise ValueError(f"'{key}' expects a JSON array")
    rows = [
        build_row(rec if isinstance(rec, dict) else {"value": rec}, i)
        for i, rec in enumerate(records)
    ]

    # Notify companies about applications that weren't there before.
    new_applications = []
    if key == "jobApplications":
        existing = {
            _application_key(row.data)
            for row in Application.objects.all()
        }
        new_applications = [
            rec for rec in records
            if isinstance(rec, dict) and _application_key(rec) not in existing
        ]

    with transaction.atomic():
        model.objects.all().delete()
        model.objects.bulk_create(rows)

    if new_applications:
        # Import here to avoid a models<->emails import cycle at app load.
        from .emails import send_application_notification

        for rec in new_applications:
            send_application_notification(rec)

    return len(rows)


def set_kv(key, value):
    KeyValueEntry.objects.update_or_create(key=key, defaults={"value": value})


# Collections whose records used to carry plaintext passwords. Auth now
# happens server-side against hashes (v2 API), so passwords are stripped
# from everything we send to browsers.
_CREDENTIAL_KEYS = {"users", "registeredCompanies"}


def _redact(record):
    if isinstance(record, dict) and "password" in record:
        record = {k: v for k, v in record.items() if k != "password"}
    return record


def collection_payload(key):
    model, _ = COLLECTIONS[key]
    rows = [row.data for row in model.objects.all()]
    if key in _CREDENTIAL_KEYS:
        rows = [_redact(r) for r in rows]
    return rows


def full_snapshot():
    # One query per collection; hasData derives from the rows already
    # fetched (no extra EXISTS round-trips — they matter when the DB is
    # in another region).
    collections = {key: collection_payload(key) for key in COLLECTIONS}
    kv_entries = list(KeyValueEntry.objects.all())
    for entry in kv_entries:
        value = entry.value
        if entry.key == "registeredCompany":
            value = _redact(value)
        collections[entry.key] = value
    has_data = bool(kv_entries) or any(collections[key] for key in COLLECTIONS)
    return {"hasData": has_data, "collections": collections}
