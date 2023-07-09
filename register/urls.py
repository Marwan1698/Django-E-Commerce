from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signupPg, name='signup'),
    path('login/', views.loginPg, name='login'),
    path('logout/', views.logoutPg, name='logout'),
]