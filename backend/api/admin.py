from django.contrib import admin
from .models import Project, CarbonCredit, Listing

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'verifier', 'status', 'created_at')
    list_filter = ('status', 'verifier')
    search_fields = ('name', 'owner__username')

@admin.register(CarbonCredit)
class CarbonCreditAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'project', 'owner', 'status', 'hedera_token_id')
    list_filter = ('status',)
    search_fields = ('project__name', 'owner__username', 'hedera_token_id')

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('credit', 'price', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('credit__project__name',)