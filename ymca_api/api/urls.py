
from api.views.bulk_status import BulkStatusUpdateView
from api.views.bulk_membership import BulkMembershipTypeUpdateView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from account import views as account_views
from api.views.category import AdminChurchDetailView, AdminChurchListCreateView, CategoryListView, ChurchListView, YouthGroupListView
from api.views.transaction import (
    ActivateMembershipView,
    RenewMembershipView,
    TotalMembersCountView,
    StartMembershipDemoView,
    VerifyPaymentView,
    RemittaWebhookView,
    InitiateDonationView
)
from api.views.members import AdminAddMembersView, AdminGetSingleRequestView, AdminGetMemberOverview, AdminMemberRetrieveUpdateDestroyView, AdminMemberUpdateDestroyView, AdminMembersBulkUploadView, AdminPromoteMemberView, AdminUpdateRequestStatusView, AdminUserRequestListView, CreateUserRequestView, CurrentUserRequestUpdateView, UserRequestDetailView, UserRequestListView, VerifyCardIdNumberView, AdminMembersExportView, AdminsExportView, SendEmailVerificationCodeView, VerifyEmailVerificationCodeView
from api.views.set_password import AdminSetUserPasswordView
from . import views
from .views import post as post_view
from api.views.staff import PrincipalOfficersListView, ManagementStaffListView, StaffMemberViewSet

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'posts', post_view.PostViewSet, basename='posts')
router.register(r'attachments', post_view.UpdateAttachmentViewSet, basename='attachments')
router.register(r'staff', StaffMemberViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', account_views.RegisterUserView.as_view(), name='register'),
    path('login/', account_views.LoginUserView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('account/', account_views.ProfileView.as_view(), name='ProfileView'),
    path('account/signature/', account_views.CardSignatureView.as_view(), name='CardSignatureView'),
    path('account/picture/', account_views.ProfileImageView.as_view(), name='ProfileImageView'),
    path('account/change-password/', account_views.PasswordChangeView.as_view(), name='password-change'),
    path('categories', CategoryListView.as_view(), name='CategoryListView'),
    path('churches', ChurchListView.as_view(), name='ChurchListView'),
    path('youth-groups', YouthGroupListView.as_view(), name='YouthGroupListView'),
    path('admin/churches/', AdminChurchListCreateView.as_view(), name='AdminChurchListCreateView'),
    path('admin/churches/<uuid:id>/', AdminChurchDetailView.as_view(), name='AdminChurchDetailView'),
    path('admin/members/', AdminAddMembersView.as_view(), name='YouthGroupListView'),
    path('admin/members/overview', AdminGetMemberOverview.as_view(), name='AdminGetMemberOverview'),
    path('admin/members/export/', AdminMembersExportView.as_view(), name='AdminMembersExportView'),
    path('admin/admins/export/', AdminsExportView.as_view(), name='AdminsExportView'),
    path('admin/members/upload/template/', AdminMembersBulkUploadView.as_view(), name='AdminMembersBulkUploadTemplateView'),
    path('admin/members/upload', AdminMembersBulkUploadView.as_view(), name='AdminMembersBulkUploadView'),
    path('admin/members/promote-admin/', AdminPromoteMemberView.as_view(), name='AdminPromoteMemberView'),
    path('admin/members/<uuid:id>/update', AdminMemberUpdateDestroyView.as_view(), name='AdminMemberUpdateDestroyView'),
    path('admin/members/<uuid:id>', AdminMemberRetrieveUpdateDestroyView.as_view(), name='AdminMemberRetrieveUpdateDestroyView'),
    path('admin/members/<uuid:user_id>/set_password/', AdminSetUserPasswordView.as_view(), name='admin-set-user-password'),
    # User endpoints
    path('requests/', CreateUserRequestView.as_view(), name='create-request'),
    path('requests/me/complete/', CurrentUserRequestUpdateView.as_view(), name='current-user-request-update'),
    path('requests/email-verification/send/', SendEmailVerificationCodeView.as_view(), name='send-email-verification-code'),
    path('requests/email-verification/verify/', VerifyEmailVerificationCodeView.as_view(), name='verify-email-verification-code'),
    path('requests/list/', UserRequestListView.as_view(), name='list-requests'),
    path('requests/<uuid:pk>/', UserRequestDetailView.as_view(), name='request-detail'),
    # Admin endpoints
    path('admin/requests/', AdminUserRequestListView.as_view(), name='admin-list-requests'),
    path('admin/requests/<uuid:pk>/', AdminGetSingleRequestView.as_view(), name='admin-get-single-request'),
    path('admin/requests/<uuid:pk>/status/', AdminUpdateRequestStatusView.as_view(), name='admin-update-request-status'),
    path('id-verification/<id_number>', VerifyCardIdNumberView.as_view(), name='VerifyCardIdNumberView'),
    path('membership/demo', StartMembershipDemoView.as_view(), name='StartMembershipDemoView'),
    path('membership/activation', ActivateMembershipView.as_view(), name='ActivateMembershipView'),
    path('membership/renewal', RenewMembershipView.as_view(), name='RenewMembershipView'),
    path('payment/verify', VerifyPaymentView.as_view(), name='VerifyPaymentView'),
    path('payment/webhook', RemittaWebhookView.as_view(), name='RemittaWebhookView'),
    path('initiate/donation', InitiateDonationView.as_view(), name='InitiateDonationView'),
    path('total-members-count', TotalMembersCountView.as_view(), name='TotalMembersCountView'),
    # Subscription endpoints
    path('subscriptions/', include('subscription.urls')),
    # Staff endpoints
    path('staff/principal-officers/', PrincipalOfficersListView.as_view(), name='PrincipalOfficersListView'),
    path('staff/management-staff/', ManagementStaffListView.as_view(), name='ManagementStaffListView'),
    path('admin/members/bulk-update-membership-type/', BulkMembershipTypeUpdateView.as_view(), name='bulk-membership-type-update'),
    path('admin/members/bulk-update-status/', BulkStatusUpdateView.as_view(), name='bulk-status-update'),
    path('admin/system/card-signature/', account_views.SystemCardSignatureView.as_view(), name='system-card-signature'),
    path('membership-fees/', account_views.MembershipFeeSettingsView.as_view(), name='membership-fee-settings'),
]
