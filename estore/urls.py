from django.urls import path
from . import views

urlpatterns = [
    path('home/',views.store_home , name='e-home'),
    path('add-item/',views.addItem , name='add-item'),
    path('edit-item/<it_id>',views.editItem , name='edit-item'),
    path('about/',views.about , name = 'about'),
    path('sell_item/',views.sell_item , name = 'sell_item'),
    path('manage_items/',views.manage_items , name = 'manage_items'),
    path('delete-item/<it_id>',views.deleteItem , name='delete-item'),
    
]