from django.shortcuts import render, redirect
from .forms import CategoryForm, ItemForm
from estore.models import Item, Category
from django.contrib.auth.decorators import login_required

# Create your views here.

def addItem(request):
    if request.method == 'POST':
        form = ItemForm(request.POST, request.FILES)
        if form.is_valid():
            item = form.save(commit=False)
            item.customer = request.user  # Assign the current user to the customer field
            item.save()
            return redirect('e-home')
    else:
        form = ItemForm()
        context = {'form': form}
        return render(request, 'estore/addItem.html', context)


def editItem(request, it_id):
    item = Item.objects.get(id = it_id)
    if request.method == 'POST':
        form = ItemForm(request.POST, request.FILES, instance=item)
        if form.is_valid():
            form.save()
            return redirect('manage_items')

    form = ItemForm(instance=item)
    context = {'form': form}
    return render(request, 'estore/addItem.html', context)


def store_home(request):
    categories = Category.objects.all()
    items = Item.objects.all()
    context = {'items': items, 'categories': categories}
    return render(request, 'estore/estore_home.html', context)

def about(request):
    return render(request,'about.html')

def sell_item(request):
    return render(request,'estore/addItem.html')

def manage_items(request):
    items = Item.objects.filter(customer = request.user)
    context = {'items': items}
    return render(request, 'estore/manage_items.html', context)

def deleteItem(request, it_id):
    item = Item.objects.get(id = it_id)
    item.delete()
    return redirect('manage_items')