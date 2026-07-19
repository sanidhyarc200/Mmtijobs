from rest_framework import serializers

from .models import Application, Company, Job, Person


class RecordSerializer(serializers.ModelSerializer):
    """Exposes the stored frontend record plus server metadata."""

    class Meta:
        fields = ["id", "order_index", "data", "updated_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        data = rep.get("data")
        if isinstance(data, dict) and "password" in data:
            rep["data"] = {k: v for k, v in data.items() if k != "password"}
        return rep


class PersonSerializer(RecordSerializer):
    class Meta(RecordSerializer.Meta):
        model = Person
        fields = RecordSerializer.Meta.fields + ["client_id", "user_type", "email", "name"]


class CompanySerializer(RecordSerializer):
    class Meta(RecordSerializer.Meta):
        model = Company
        fields = RecordSerializer.Meta.fields + ["client_id", "name", "email"]


class JobSerializer(RecordSerializer):
    class Meta(RecordSerializer.Meta):
        model = Job
        fields = RecordSerializer.Meta.fields + ["client_id", "title", "company_name", "status"]


class ApplicationSerializer(RecordSerializer):
    class Meta(RecordSerializer.Meta):
        model = Application
        fields = RecordSerializer.Meta.fields + ["job_client_id", "user_client_id", "status"]
