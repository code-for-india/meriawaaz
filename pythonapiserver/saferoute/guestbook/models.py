from django.db import models
from django.contrib.auth.models import User

class Greeting(models.Model):
    author = models.ForeignKey(User, null=True, blank=True)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)