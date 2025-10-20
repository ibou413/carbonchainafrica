from django.contrib import admin
from .models import UserProfile

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'hedera_account_id')
    search_fields = ('user__username', 'hedera_account_id')
    list_filter = ('role',)

admin.site.register(UserProfile, UserProfileAdmin)