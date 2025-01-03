from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'core'

urlpatterns = [
    # Login
    path('login/', auth_views.LoginView.as_view(template_name='core/auth.html'), name='login'),

    # Logout
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # Dashboard
    path('', views.DashboardView.as_view(), name='dashboard'),

    # Users
    path('users/', views.UsersView.as_view(), name='list'),
    path('users/deleted', views.UsersDeletedView.as_view(), name='deleted-list'),
    path('user/new', views.UserCreateView.as_view(), name='register'),
    path('user/<uuid:pk>', views.UserDetailView.as_view(), name='detail'),
    path('user/<uuid:pk>/edit', views.UserEditView.as_view(), name='edit'),
    path('user/<uuid:pk>/delete', views.user_delete_view, name='delete'),
    path('user/<uuid:pk>/activate', views.user_active_view, name='activate'),
]