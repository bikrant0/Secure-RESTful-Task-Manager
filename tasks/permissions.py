from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # This returns True if the task's user matches the person holding the JWT token.
        return obj.user == request.user