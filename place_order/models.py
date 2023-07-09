from django.db import models
from estore.models import Item
from register.models import CustomUser
from django.core.validators import RegexValidator

# Create your models here.
class Cart(models.Model):
    CHECK_STATUS = (
    ('new', 'New'),
    ('done', 'Done'),
    )
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    numOfItems = models.IntegerField(default=0)
    total_price = models.FloatField(default=0.0)
    status = models.CharField(max_length=50, null=True, choices=CHECK_STATUS, default='new')
    def __str__(self):
        return self.customer.username + "'s Cart"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    item_quantity = models.IntegerField(default=0)
    def __str__(self):
        return self.item.name

class Order(models.Model):
    CHECK_STATUS = (
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    )
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE)
    address = models.CharField(max_length=100)
    phone_num =  models.CharField(max_length=11, validators=[RegexValidator(r'^[0-9]{1,11}$')])
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, null=True, choices=CHECK_STATUS, default='pending')
    def __str__(self):
        return self.customer.username + "'s Order"


class Bill(models.Model):
    PAYMENT_METHOD = (
    ('cash', 'Cash'),
    ('credit_card', 'Credit Card'),
    )
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD, default='cash')
    payment_date = models.DateTimeField(auto_now_add=True)
    credit_card = models.CharField(max_length=50, null=True)
    def __str__(self):
        return self.order.customer.username + "'s Bill"