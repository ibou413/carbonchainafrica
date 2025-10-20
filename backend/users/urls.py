from django.urls import path
from .views import RegisterAPI, LoginAPI, LogoutAPI, UserProfileDetailAPIView

app_name = 'users'

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('profile/', UserProfileDetailAPIView.as_view(), name='user-profile'),
]
