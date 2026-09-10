from rest_framework.permissions import BasePermission

class HasRole(BasePermission):
    message = "No tienes permisos para realizar esta acción."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        required_roles = getattr(view, "required_roles", None)
        if not required_roles:
            return True

        if getattr(user, "is_superuser", False):
            return True

        user_roles = set(user.groups.values_list("name", flat=True))
        if not user_roles:
            user_roles.add("participante")
        return any(role in user_roles for role in required_roles)