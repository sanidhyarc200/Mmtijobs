from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import sync
from .models import Application, Company, Job, Person
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
