from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Customer
from django.utils.translation import gettext_lazy as _

class CustomUserAdmin(UserAdmin):
    model = Customer
    list_display = ('email', 'nickname', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('nickname', 'birthdate', 'profileimage')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'nickname', 'birthdate', 'profileimage', 'is_active', 'is_staff', 'is_superuser')}
        ),
    )
    search_fields = ('email', 'nickname')
    ordering = ('email',)

# Register your models here.
admin.site.register(Customer)