from django.db import models
from django.contrib.auth.models import User
from django.conf import settings







class UserProfile(models.Model):
    """
    Extends the default User model to include Hedera-specific fields and user roles.
    """
    class Role(models.TextChoices):
        BUYER = 'BUYER', 'Buyer'
        SELLER = 'SELLER', 'Seller'
        VERIFIER = 'VERIFIER', 'Verifier'
        ADMIN = 'ADMIN', 'Admin'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.BUYER)
    hedera_account_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f'{self.user.username} - {self.get_role_display()}'