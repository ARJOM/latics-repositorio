from django.db import models
from app.core.models import CreateUpdateModel, UUIDUser


class Projeto(CreateUpdateModel):
    VIDEO = 'video'
    SITE = 'site'
    
    PROJECT_TYPE_CHOICES = [
        (VIDEO, 'Video'),
        (SITE, 'Site'),
    ]
    
    url = models.URLField('Link do projeto', max_length=500)
    project_type = models.CharField(
        'Tipo de projeto',
        max_length=10,
        choices=PROJECT_TYPE_CHOICES,
        default=SITE,
    )

    class Meta:
        verbose_name = 'Projeto'
        verbose_name_plural = 'Projetos'
    
    def __str__(self):
        return f"{self.get_project_type_display()} - {self.url}"