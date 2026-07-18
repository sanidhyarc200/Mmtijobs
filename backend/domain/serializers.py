from rest_framework import serializers

from .models import Account, CompanyProfile, JobApplication, JobPost


class AccountSerializer(serializers.ModelSerializer):
    """Public view of an account — never exposes the password hash."""

    class Meta:
        model = Account
        fields = [
            "id", "client_id", "email", "user_type", "name", "contact",
            "profile", "is_active", "created_at",
        ]
        read_only_fields = ["id", "client_id", "user_type", "is_active", "created_at"]


class CompanySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = CompanyProfile
        fields = [
            "id", "client_id", "name", "email", "contact", "street_address",
            "city", "state", "pincode", "gst_number", "industry_type",
            "number_of_employees", "website", "profile_pic", "owner_email",
            "created_at",
        ]
        read_only_fields = ["id", "client_id", "created_at", "owner_email"]


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_email = serializers.EmailField(source="company.email", read_only=True)
    applicant_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = JobPost
        fields = [
            "id", "client_id", "title", "status", "location", "salary",
            "description", "job_type", "qualification", "experience",
            "gender", "number_of_openings", "tags", "hiring_process",
            "active_until", "seed_priority", "status_changed_at", "extra",
            "company", "company_name", "company_email", "posted_by",
            "applicant_count", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "client_id", "status", "status_changed_at", "company",
            "posted_by", "created_at", "updated_at",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    applicant_name = serializers.CharField(source="applicant.name", read_only=True)
    applicant_email = serializers.EmailField(source="applicant.email", read_only=True)
    applicant_contact = serializers.CharField(source="applicant.contact", read_only=True)
    applicant_profile = serializers.JSONField(source="applicant.profile", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id", "job", "status", "applied_at", "job_title", "company_name",
            "applicant_name", "applicant_email", "applicant_contact",
            "applicant_profile",
        ]
        read_only_fields = ["id", "job", "applied_at"]
