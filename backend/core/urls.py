from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("users", views.PersonViewSet)
router.register("companies", views.CompanyViewSet)
router.register("jobs", views.JobViewSet)
router.register("applications", views.ApplicationViewSet)

urlpatterns = [
    path("health/", views.health),
    path("bootstrap/", views.bootstrap),
    path("collections/<str:key>/", views.collection),
    path("", include(router.urls)),
]
