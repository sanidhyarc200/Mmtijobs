from django.contrib import admin

from .models import (
    Account,
    AuthToken,
    CompanyProfile,
    CustomListEntry,
    JobApplication,
    JobPost,
    SavedJob,
)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ["email", "name", "user_type", "contact", "is_active", "created_at"]
    list_filter = ["user_type", "is_active"]
    search_fields = ["email", "name", "contact"]
    exclude = ["password_hash"]


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "city", "industry_type", "owner", "created_at"]
    search_fields = ["name", "email"]


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "status", "location", "created_at"]
    list_filter = ["status"]
    search_fields = ["title", "company__name"]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ["applicant", "job", "status", "applied_at"]
    list_filter = ["status"]


admin.site.register(AuthToken)
admin.site.register(SavedJob)
admin.site.register(CustomListEntry)
