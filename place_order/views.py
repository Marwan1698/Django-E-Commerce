from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from estore.models import Item
from .models import Cart, CartItem, Order, Bill
from register.models import CustomUser
from django.contrib import messages

# Create your views here.
@login_required(login_url='login')
def addtocart(request, it_id):
    item = Item.objects.get(id = it_id)
    cart, created = Cart.objects.get_or_create(customer = request.user, status = 'new')

    if cart.status == 'new':
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, item=item)
        if item.quantity > 0:
            #if not item_created:
            cart_item.item_quantity += 1
            cart_item.save()

            cart.numOfItems += 1
            cart.total_price += item.price
            item.quantity -= 1
            item.save()
            cart.save()
        else:
            messages.error(request, f"Sorry, {item.name} is out of stock.")
    return redirect('e-home')
    
@login_required(login_url='login')
def removefromcart(request, it_id):
    item = Item.objects.get(id = it_id)
    cart, created = Cart.objects.get_or_create(customer = request.user, status = 'new')

    if cart.status == 'new':
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, item=item)
        if cart_item.item_quantity > 0:
        #if not item_created:
            cart_item.item_quantity -= 1
            if cart_item.item_quantity == 0:
                cart_item.delete()
            else:
                cart_item.save()

            cart.numOfItems -= 1
            cart.total_price -= item.price
            item.quantity += 1
            item.save()
            cart.save()
    return redirect('e-home')

@login_required(login_url='login')
def viewCart(request):
    icart = Cart.objects.get(customer = request.user, status = 'new')
    if icart.status == 'new':
        cart_items = CartItem.objects.filter(cart=icart)
        total_price = sum(cart_item.item.price * cart_item.item_quantity for cart_item in cart_items)
        context = {'cart_items': cart_items, 'cart': icart, 'total_price': total_price}
        return render(request, 'place_order/cart.html', context)
    else:
        messages.error(request, "Your shopping cart is empty!")
        return redirect('e-home')

def deleteItemfromCart(request, it_id):
    item = Item.objects.get(id = it_id)
    cart, created = Cart.objects.get_or_create(customer = request.user, status = 'new')
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, item=item)

    #print(f'cart: {cart_item.item_quantity}')

    cart.numOfItems -= cart_item.item_quantity
    cart.total_price -= cart_item.item_quantity * item.price
    cart.save()
    cart_item.delete()
    return redirect('viewCart')

def makeOrder(request):
    icart = Cart.objects.get(customer = request.user, status = 'new')
    cart_items = CartItem.objects.filter(cart=icart)
    if request.method == 'POST':
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        payment = request.POST.get('payment')
        card_number = request.POST.get('cardNumber')

        user = CustomUser.objects.get(id = request.user.id)
        user.address = address
        user.phone_num = phone
        user.save()

        order = Order.objects.create(cart=icart, address=address, phone_num=phone, customer=request.user)
        order.save()
        bill = Bill.objects.create(payment_method=payment, order=order, credit_card=card_number)
        bill.save()
        icart.status = 'done'
        icart.save()
        messages.error(request, 'Thanks for your order!')
    return redirect('e-home')
def viewOrders(request):
    orders = Order.objects.filter(customer = request.user)
    context = {'orders': orders}
    return render(request, 'place_order/orders.html', context)

def orderDetails(request, order_id):
    order = Order.objects.get(id = order_id)
    icart = order.cart
    cart_items = CartItem.objects.filter(cart=icart)
    total_price = sum(cart_item.item.price * cart_item.item_quantity for cart_item in cart_items)
    context = {'cart_items': cart_items, 'cart': icart, 'total_price': total_price}
    return render(request, 'place_order/order_details.html', context)

def deleteOrder(request, order_id):
    order = Order.objects.get(id = order_id)
    order.delete()
    return redirect('viewOrders')