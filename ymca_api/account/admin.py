from django.contrib import admin

from account.models import Category, Church, IDCard, User, YouthGroup, MembershipFeeSettings, BirthdayWish

# Register your models here.


class BirthdayWishAdmin(admin.ModelAdmin):
    list_display = ('user', 'year', 'sent_at', 'is_sent')
    list_filter = ('year', 'is_sent', 'sent_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    date_hierarchy = 'sent_at'
    readonly_fields = ('sent_at',)


admin.site.register(User)
admin.site.register(IDCard)
admin.site.register(Church)
admin.site.register(YouthGroup)
admin.site.register(Category)
admin.site.register(MembershipFeeSettings)
admin.site.register(BirthdayWish, BirthdayWishAdmin)