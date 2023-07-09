from django.db import models
from register.models import CustomUser
# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name
    
class Item(models.Model):
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    price = models.IntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    description = models.CharField(max_length=250, default='', blank=True, null=True)
    quantity = models.IntegerField(default=0)
    image = models.ImageField(upload_to='estore/items/')

    def __str__(self):
        return self.name