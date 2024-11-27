from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, TemplateView
from django.views.generic.edit import CreateView, UpdateView
from .models import Projeto

# Projeto detail
# - - - - - - - - - - - - - - - - - - - -
class ProjetoDetailView(DetailView):
    model = Projeto
    template_name = 'projetos/detail.html'

    def get(self, request, *args, **kwargs):
        # if not request.user.is_staff or kwargs['pk'] != request.user.id:
        #     return redirect('core:dashboard')
        return super().get(request, *args, **kwargs)