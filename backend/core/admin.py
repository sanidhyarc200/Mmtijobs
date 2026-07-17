from django.contrib import admin

from .models import Application, Company, Job, KeyValueEntry, Person


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "user_type", "client_id", "updated_at"]
    search_fields = ["name", "email"]
    list_filter = ["user_type"]


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "client_id", "updated_at"]
    search_fields = ["name", "email"]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "company_name", "status", "client_id", "updated_at"]
    search_fields = ["title", "company_name"]
    list_filter = ["status"]


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["job_client_id", "user_client_id", "status", "updated_at"]
    list_filter = ["status"]


@admin.register(KeyValueEntry)
class KeyValueEntryAdmin(admin.ModelAdmin):
    list_display = ["key", "updated_at"]
