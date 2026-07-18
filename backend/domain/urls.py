from django.urls import path

from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.register),
    path("auth/register-company/", views.register_company),
    path("auth/login/", views.login),
    path("auth/logout/", views.logout),
    path("auth/me/", views.me),
    # Jobs
    path("jobs/", views.jobs),
    path("jobs/<int:pk>/", views.job_detail),
    path("jobs/<int:pk>/status/", views.job_set_status),
    path("jobs/<int:pk>/apply/", views.apply),
    path("jobs/<int:pk>/applications/", views.job_applications),
    # Applications
    path("applications/mine/", views.my_applications),
    path("applications/<int:pk>/", views.application_detail),
    # Companies & admin
    path("companies/", views.companies),
    path("companies/<int:pk>/", views.company_detail),
    path("companies/<int:pk>/impersonate/", views.impersonate),
    path("admin/applicants/", views.applicants_list),
    path("admin/stats/", views.stats),
    # Dropdown lists
    path("lists/<str:list_name>/", views.custom_list),
]
