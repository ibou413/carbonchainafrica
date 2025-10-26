from rest_framework import permissions
from users.models import UserProfile

class IsSellerUser(permissions.BasePermission):
    """
    Allows access only to users with the 'SELLER' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == UserProfile.Role.SELLER

class IsVerifierUser(permissions.BasePermission):
    """
    Allows access only to users with the 'VERIFIER' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == UserProfile.Role.VERIFIER

class IsBuyerUser(permissions.BasePermission):
    """
    Allows access only to users with the 'BUYER' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == UserProfile.Role.BUYER