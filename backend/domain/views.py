"""
v2 domain API — implements the rules the frontend enforces today, but
server-side: hashed passwords, token auth, ownership checks, and the
pending -> active job approval lifecycle.
"""

from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from rest_framework import status as http
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from .auth import (
    APPROVER_ROLES,
    STAFF_ROLES,
    AccountTokenAuthentication,
    IsAdmin,
    IsApprover,
    IsAuthenticatedAccount,
)
from .models import (
    Account,
    AuthToken,
    CompanyProfile,
    CustomListEntry,
    JobApplication,
    JobPost,
)
from .serializers import (
    AccountSerializer,
    ApplicationSerializer,
    CompanySerializer,
    JobSerializer,
)


def _auth(*perms):
    """Decorator stack shared by every protected endpoint."""

    def wrap(fn):
        fn = permission_classes([IsAuthenticatedAccount, *perms])(fn)
        return authentication_classes([AccountTokenAuthentication])(fn)

    return wrap


def _error(msg, code=http.HTTP_400_BAD_REQUEST):
    return Response({"error": msg}, status=code)


def _issue_session(account, impersonated_by=None):
    token = AuthToken.issue(account, impersonated_by=impersonated_by)
    payload = {
        "token": token.key,
        "user": AccountSerializer(account).data,
    }
    if impersonated_by:
        payload["impersonating"] = True
    company = CompanyProfile.objects.filter(owner=account).first()
    if company:
        payload["company"] = CompanySerializer(company).data
    return payload


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@api_view(["POST"])
def register(request):
    """Applicant signup (the onboarding form)."""
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    contact = str(data.get("contact") or "").strip()

    if not email or "@" not in email:
        return _error("A valid email is required.")
    if len(password) < 8:
        return _error("Password must be at least 8 characters.")
    if Account.objects.filter(email__iexact=email).exists():
        return _error("This email is already registered.")
    if contact and Account.objects.filter(contact=contact).exists():
        return _error("This mobile number is already registered.")

    profile = {
        k: v
        for k, v in data.items()
        if k not in {"email", "password", "confirmPassword", "contact", "name"}
    }
    name = (
        data.get("name")
        or " ".join(
            p for p in [data.get("firstName"), data.get("middleName"), data.get("lastName")] if p
        ).strip()
    )
    account = Account(
        email=email, user_type="applicant", name=name, contact=contact, profile=profile
    )
    account.set_password(password)
    account.save()
    return Response(_issue_session(account), status=http.HTTP_201_CREATED)


@api_view(["POST"])
def register_company(request):
    """Company registration — creates the company + its recruiter account."""
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()
    contact = str(data.get("contact") or "").strip()
    gst = (data.get("gstNumber") or "").strip().upper()

    if not name:
        return _error("Company name is required.")
    if not email or "@" not in email:
        return _error("A valid email is required.")
    if len(password) < 8:
        return _error("Password must be at least 8 characters.")
    if Account.objects.filter(email__iexact=email).exists() or CompanyProfile.objects.filter(
        email__iexact=email
    ).exists():
        return _error("This email is already registered.")
    if contact and Account.objects.filter(contact=contact).exists():
        return _error("This mobile number is already registered.")
    if gst and CompanyProfile.objects.filter(gst_number=gst).exists():
        return _error("This GST number is already registered.")

    with transaction.atomic():
        account = Account(
            email=email, user_type="recruiter", name=name, contact=contact
        )
        account.set_password(password)
        account.save()
        CompanyProfile.objects.create(
            owner=account,
            name=name,
            email=email,
            contact=contact,
            street_address=data.get("streetAddress", ""),
            city=data.get("city", ""),
            state=data.get("state", ""),
            pincode=data.get("pincode", ""),
            gst_number=gst,
            industry_type=data.get("industryType", ""),
            number_of_employees=data.get("numberOfEmployees", ""),
            website=data.get("companyWebsite", ""),
            profile_pic=data.get("profilePic") or "",
        )
    return Response(_issue_session(account), status=http.HTTP_201_CREATED)


@api_view(["POST"])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    account = Account.objects.filter(email__iexact=email, is_active=True).first()
    if account is None or not account.check_password(password):
        return _error("Invalid email or password.", http.HTTP_401_UNAUTHORIZED)
    return Response(_issue_session(account))


@api_view(["POST"])
@_auth()
def logout(request):
    request.auth.delete()
    return Response({"ok": True})


@api_view(["GET", "PUT"])
@_auth()
def me(request):
    if request.method == "GET":
        return Response(_me_payload(request))
    serializer = AccountSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(_me_payload(request))


def _me_payload(request):
    payload = {"user": AccountSerializer(request.user).data}
    company = CompanyProfile.objects.filter(owner=request.user).first()
    if company:
        payload["company"] = CompanySerializer(company).data
    if request.auth and request.auth.impersonated_by:
        payload["impersonating"] = True
    return payload


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------

def _job_qs():
    return JobPost.objects.select_related("company").annotate(
        applicant_count=Count("applications")
    )


@api_view(["GET", "POST"])
@authentication_classes([AccountTokenAuthentication])
def jobs(request):
    if request.method == "GET":
        qs = _job_qs()
        role = getattr(request.user, "user_type", None)
        wanted = request.query_params.get("status")
        if role in STAFF_ROLES:
            if wanted:
                qs = qs.filter(status=wanted)
        elif role == "recruiter":
            company = CompanyProfile.objects.filter(owner=request.user).first()
            mine = request.query_params.get("mine")
            if mine and company:
                qs = qs.filter(company=company)
            else:
                qs = qs.filter(status="active")
        else:
            # Public / applicant view: only live jobs
            today = timezone.localdate()
            qs = qs.filter(status="active").exclude(active_until__lt=today)
        return Response(JobSerializer(qs, many=True).data)

    # POST — recruiters only; new jobs always start pending (admin approves)
    if getattr(request.user, "user_type", None) != "recruiter":
        return _error("Only recruiters can post jobs.", http.HTTP_403_FORBIDDEN)
    company = CompanyProfile.objects.filter(owner=request.user).first()
    if company is None:
        return _error("No company profile linked to this account.", http.HTTP_403_FORBIDDEN)

    serializer = JobSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    job = serializer.save(company=company, posted_by=request.user, status="pending")
    # client_id mirrors pk so the legacy-collection mirror of this job and
    # re-runs of migrate_collections stay idempotent.
    job.client_id = job.pk
    job.save(update_fields=["client_id"])
    return Response(JobSerializer(job).data, status=http.HTTP_201_CREATED)


def _can_manage(job, account):
    if account.user_type in STAFF_ROLES:
        return True
    return job.company and job.company.owner_id == account.id


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([AccountTokenAuthentication])
def job_detail(request, pk):
    job = _job_qs().filter(pk=pk).first()
    if job is None:
        return _error("Job not found.", http.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        if job.status != "active" and not (
            request.user and getattr(request.user, "user_type", None) and _can_manage(job, request.user)
        ):
            return _error("Job not found.", http.HTTP_404_NOT_FOUND)
        return Response(JobSerializer(job).data)

    if not getattr(request.user, "user_type", None):
        return _error("Authentication required.", http.HTTP_401_UNAUTHORIZED)
    if not _can_manage(job, request.user):
        return _error("You don't manage this job.", http.HTTP_403_FORBIDDEN)

    if request.method == "DELETE":
        job.delete()
        return Response({"ok": True})

    serializer = JobSerializer(job, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(JobSerializer(job).data)


@api_view(["POST"])
@_auth(IsApprover)
def job_set_status(request, pk):
    """Approve / activate / deactivate — admin & HR manager only."""
    job = JobPost.objects.filter(pk=pk).first()
    if job is None:
        return _error("Job not found.", http.HTTP_404_NOT_FOUND)
    new_status = request.data.get("status")
    if new_status not in {"active", "inactive", "pending"}:
        return _error("status must be active, inactive or pending.")
    job.status = new_status
    job.status_changed_at = timezone.now()
    job.save(update_fields=["status", "status_changed_at", "updated_at"])
    return Response(JobSerializer(_job_qs().get(pk=pk)).data)


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

@api_view(["POST"])
@_auth()
def apply(request, pk):
    if request.user.user_type != "applicant":
        return _error("Only jobseekers can apply.", http.HTTP_403_FORBIDDEN)
    job = JobPost.objects.filter(pk=pk, status="active").first()
    if job is None:
        return _error("Job not found or not active.", http.HTTP_404_NOT_FOUND)
    application, created = JobApplication.objects.get_or_create(
        job=job, applicant=request.user
    )
    if created:
        # Reuse the existing branded notification pipeline
        from core.emails import send_application_notification

        send_application_notification(
            {"jobId": job.client_id, "userId": request.user.client_id, "jobTitle": job.title}
        )
    return Response(
        ApplicationSerializer(application).data,
        status=http.HTTP_201_CREATED if created else http.HTTP_200_OK,
    )


@api_view(["GET"])
@_auth()
def my_applications(request):
    qs = JobApplication.objects.filter(applicant=request.user).select_related(
        "job", "job__company"
    )
    return Response(ApplicationSerializer(qs, many=True).data)


@api_view(["GET"])
@_auth()
def job_applications(request, pk):
    job = JobPost.objects.filter(pk=pk).first()
    if job is None:
        return _error("Job not found.", http.HTTP_404_NOT_FOUND)
    if not _can_manage(job, request.user):
        return _error("You don't manage this job.", http.HTTP_403_FORBIDDEN)
    qs = job.applications.select_related("applicant", "job", "job__company")
    return Response(ApplicationSerializer(qs, many=True).data)


@api_view(["PATCH"])
@_auth()
def application_detail(request, pk):
    application = JobApplication.objects.select_related("job", "job__company").filter(pk=pk).first()
    if application is None:
        return _error("Application not found.", http.HTTP_404_NOT_FOUND)
    if not _can_manage(application.job, request.user):
        return _error("You don't manage this application.", http.HTTP_403_FORBIDDEN)
    serializer = ApplicationSerializer(application, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Companies & admin
# ---------------------------------------------------------------------------

@api_view(["GET"])
@_auth(IsAdmin)
def companies(request):
    return Response(
        CompanySerializer(CompanyProfile.objects.select_related("owner"), many=True).data
    )


@api_view(["PUT"])
@_auth()
def company_detail(request, pk):
    company = CompanyProfile.objects.filter(pk=pk).first()
    if company is None:
        return _error("Company not found.", http.HTTP_404_NOT_FOUND)
    if request.user.user_type != "admin" and company.owner_id != request.user.id:
        return _error("You don't manage this company.", http.HTTP_403_FORBIDDEN)
    serializer = CompanySerializer(company, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET"])
@_auth(IsAdmin)
def applicants_list(request):
    qs = Account.objects.filter(user_type="applicant")
    return Response(AccountSerializer(qs, many=True).data)


@api_view(["POST"])
@_auth(IsAdmin)
def impersonate(request, pk):
    """Admin gets a real recruiter session for a company (audited)."""
    company = CompanyProfile.objects.select_related("owner").filter(pk=pk).first()
    if company is None or company.owner is None:
        return _error("Company has no linked recruiter account.", http.HTTP_404_NOT_FOUND)
    return Response(_issue_session(company.owner, impersonated_by=request.user))


@api_view(["GET"])
@_auth(IsAdmin)
def stats(request):
    return Response(
        {
            "jobs": {
                "total": JobPost.objects.count(),
                "active": JobPost.objects.filter(status="active").count(),
                "pending": JobPost.objects.filter(status="pending").count(),
                "inactive": JobPost.objects.filter(status="inactive").count(),
            },
            "companies": CompanyProfile.objects.count(),
            "applicants": Account.objects.filter(user_type="applicant").count(),
            "applications": JobApplication.objects.count(),
        }
    )


# ---------------------------------------------------------------------------
# Custom dropdown lists
# ---------------------------------------------------------------------------

@api_view(["GET", "POST"])
@authentication_classes([AccountTokenAuthentication])
def custom_list(request, list_name):
    if list_name not in {"jobTitles", "qualifications"}:
        return _error("Unknown list.", http.HTTP_404_NOT_FOUND)
    if request.method == "POST":
        if not getattr(request.user, "user_type", None):
            return _error("Authentication required.", http.HTTP_401_UNAUTHORIZED)
        value = (request.data.get("value") or "").strip()
        if value:
            CustomListEntry.objects.get_or_create(list_name=list_name, value=value)
    values = CustomListEntry.objects.filter(list_name=list_name).values_list(
        "value", flat=True
    )
    return Response(sorted(values))
