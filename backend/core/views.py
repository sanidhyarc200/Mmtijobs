from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import sync
from .models import Application, Company, Job, KeyValueEntry, Person

password_reset_signer = TimestampSigner(salt="mmtjobs-password-reset")
PASSWORD_RESET_MAX_AGE = 60 * 60  # 1 hour
from .serializers import (
    ApplicationSerializer,
    CompanySerializer,
    JobSerializer,
    PersonSerializer,
)


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
def bootstrap(request):
    """Everything the frontend needs to hydrate localStorage in one call."""
    return Response(sync.full_snapshot())


@api_view(["GET", "PUT"])
def collection(request, key):
    """
    GET  /api/collections/<key>/  -> current value
    PUT  /api/collections/<key>/  -> replace value with request body
    """
    if key not in sync.SYNCABLE_KEYS:
        return Response({"error": f"unknown collection '{key}'"}, status=404)

    if request.method == "GET":
        if key in sync.COLLECTIONS:
            return Response(sync.collection_payload(key))
        entry = sync.KeyValueEntry.objects.filter(key=key).first()
        return Response(entry.value if entry else None)

    try:
        if key in sync.COLLECTIONS:
            count = sync.replace_collection(key, request.data)
            return Response({"ok": True, "count": count})
        sync.set_kv(key, request.data)
        return Response({"ok": True})
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)


@api_view(["POST"])
def password_reset_request(request):
    """Send a reset link if the email belongs to a user or company."""
    email = (request.data.get("email") or "").strip()
    if not email:
        return Response({"error": "email required"}, status=400)

    known = (
        Person.objects.filter(email__iexact=email).exists()
        or Company.objects.filter(email__iexact=email).exists()
    )
    if known:
        from .emails import send_password_reset_email

        token = password_reset_signer.sign(email.lower())
        send_password_reset_email(email, token)

    # Same response either way, so the endpoint can't be used to
    # discover which emails are registered.
    return Response({"ok": True})


@api_view(["POST"])
def password_reset_confirm(request):
    token = request.data.get("token") or ""
    new_password = request.data.get("newPassword") or ""
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)

    try:
        email = password_reset_signer.unsign(token, max_age=PASSWORD_RESET_MAX_AGE)
    except SignatureExpired:
        return Response({"error": "This reset link has expired. Please request a new one."}, status=400)
    except BadSignature:
        return Response({"error": "Invalid reset link."}, status=400)

    updated = 0
    for person in Person.objects.filter(email__iexact=email):
        person.data = {**person.data, "password": new_password}
        person.save(update_fields=["data", "updated_at"])
        updated += 1
    for company in Company.objects.filter(email__iexact=email):
        company.data = {**company.data, "password": new_password}
        company.save(update_fields=["data", "updated_at"])
        updated += 1

    # Legacy single-company key used by the login modal fallback
    entry = KeyValueEntry.objects.filter(key="registeredCompany").first()
    if (
        entry
        and isinstance(entry.value, dict)
        and (entry.value.get("email") or "").lower() == email
    ):
        entry.value = {**entry.value, "password": new_password}
        entry.save(update_fields=["value", "updated_at"])

    if not updated:
        return Response({"error": "No account found for this email."}, status=404)
    return Response({"ok": True})


class PersonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer


class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
