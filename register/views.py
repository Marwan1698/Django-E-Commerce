from django.shortcuts import render, redirect
from django.http import HttpResponse

from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .forms import UserForm

# Create your views here.

def loginPg(request):
    if request.user.is_authenticated:
        return redirect('e-home')
    else:
        if request.method == 'POST':
            name = request.POST.get('username')
            passwrd = request.POST.get('password')
            user = authenticate(username = name, password = passwrd)
            if user is not None:
                if user.user_role == 'customer':
                    login(request, user)
                    if request.GET.get('next') is not None:
                        return redirect(request.GET.get('next'))
                    else:
                        return redirect('e-home')
                else:
                    login(request, user)
                    admin_url = reverse('admin:index')
                    return redirect(admin_url)
            else:
                messages.info(request, 'Username or password is incorrect')

        return render(request, 'register/login.html')
    


def signupPg(request):
    signup_form = UserForm()
    if request.method =='POST':
        signup_form = UserForm(request.POST)
        if signup_form.is_valid():
            signup_form.save()
            msg = 'User is created successfully with username: ' + signup_form.cleaned_data.get('username')
            messages.info(request, msg)
            return redirect('login')
        
    context = {'signup_form': signup_form}
    return render(request, 'register/signup.html', context)
    
def logoutPg(request):
    logout(request)
    return redirect('login')
