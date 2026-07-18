"""Token authentication + role permissions for the v2 API."""

from rest_framework import authentication, exceptions, permissions

from .models import AuthToken

STAFF_ROLES = {"admin", "hr", "hr_manager", "hr_recruiter"}
APPROVER_ROLES = {"admin", "hr_manager"}


class AccountTokenAuthentication(authentication.BaseAuthentication):
    """Authorization: Bearer <token>  (issued by /api/v2/auth/login)."""

    keyword = "bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode()
        if not header:
            return None
        parts = header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword:
            return None
        token = (
            AuthToken.objects.select_related("account")
            .filter(key=parts[1])
            .first()
        )
        if token is None or not token.account.is_active:
            raise exceptions.AuthenticationFailed("Invalid or expired token.")
        # DRF sets request.user / request.auth from this pair
        return (token.account, token)


class IsAuthenticatedAccount(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, "user_type", None))


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "user_type", None) in STAFF_ROLES


class IsApprover(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "user_type", None) in APPROVER_ROLES


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "user_type", None) == "admin"
