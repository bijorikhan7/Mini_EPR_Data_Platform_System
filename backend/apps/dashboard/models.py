from django.db import models


class DashboardSnapshot(models.Model):
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
