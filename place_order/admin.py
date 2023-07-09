from django.contrib import admin
from place_order.models import Cart, CartItem, Order, Bill

# Register your models here.
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(Bill)