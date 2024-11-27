from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'projetos'

urlpatterns = [
    path('projeto/<uuid:pk>', views.ProjetoDetailView.as_view(), name='detail'),
]
