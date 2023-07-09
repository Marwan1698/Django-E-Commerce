from django.urls import path
from . import views

urlpatterns = [
    path('addtocart/<it_id>', views.addtocart, name='addtocart'),
    path('removefromcart/<it_id>', views.removefromcart, name='removefromcart'),
    path('cart', views.viewCart, name='viewCart'),
    path('deleteItemfromCart/<it_id>', views.deleteItemfromCart, name='deleteItemfromCart'),
    path('order', views.makeOrder, name='makeOrder'),
    path('order_details/<order_id>', views.orderDetails, name='orderDetails'),
    path('delete_order/<order_id>', views.deleteOrder, name='deleteOrder'),
    path('viewOrders', views.viewOrders, name='viewOrders'),
]