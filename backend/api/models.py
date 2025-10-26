from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


class Project(models.Model):
    class ProjectStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    verifier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_projects', limit_choices_to={'profile__role': 'VERIFIER'})
    name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=255)
    tonnage = models.PositiveIntegerField(default=0)
    vintage = models.PositiveIntegerField(default=2024)
    status = models.CharField(max_length=10, choices=ProjectStatus.choices, default=ProjectStatus.PENDING)
    projectId = models.CharField(max_length=255, blank=True, null=True)
    metadata_cid = models.CharField(max_length=255, blank=True, null=True) # IPFS CID for project metadata JSON
    image_cid = models.CharField(max_length=255, blank=True, null=True)    # IPFS CID for project image
    document_cid = models.CharField(max_length=255, blank=True, null=True) # IPFS CID for project document
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CarbonCredit(models.Model):
    class CreditStatus(models.TextChoices):
        MINTED = 'MINTED', 'Minted'
        LISTED = 'LISTED', 'Listed for Sale'
        SOLD = 'SOLD', 'Sold'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='credits')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_credits')
    hedera_token_id = models.CharField(max_length=255)
    serial_number = models.BigIntegerField()
    status = models.CharField(max_length=10, choices=CreditStatus.choices, default=CreditStatus.MINTED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['hedera_token_id', 'serial_number']

    def __str__(self):
        return f'Credit #{self.serial_number} for {self.project.name}'

class Listing(models.Model):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings', null=True)
    credit = models.OneToOneField(CarbonCredit, on_delete=models.CASCADE, related_name='listing')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    claimed = models.BooleanField(default=False) # New field to track if proceeds have been claimed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Listing for {self.credit} at ${self.price}'