// Shopping cart is not session based at this stage - Next step: use localstorage
// Further work: implement this in React

import './index.scss';
const ProductsData = require('./products.json');
const $ = window.$;

//----------------------------------------------------

class ShoppingCart{

    constructor(){
        this.products = []; //  [{pId:"",pQuantity:0}]
        this.voucher = 0;
    }

    addProductToCart(id){
        // 1. As a User I can add a product to my shopping cart.
        // 7. As a User I am unable to Out of Stock products to the shopping cart

        //console.log("this.products: ",this.products);
        //console.log("ProductsData: ", ProductsData[id]);
        
        let data = ProductsData[id];
        let quantity = parseInt(data.quantity,10);
        let result = getCartQuantity(this.products,id); //[prodIndex,cartItemQuantity]
        let prodIndex = result[0];
        let cartItemQuantity = result[1];
        
        if (cartItemQuantity < quantity){
            //add only if number of current items are less than quantity
            if (prodIndex !== -1){
                // If item exists, only add the quantity & update cart display
                this.products[prodIndex].pQuantity = this.products[prodIndex].pQuantity + 1;
                $('#tr-'+id+' td .product-quantity').text(this.products[prodIndex].pQuantity);
                $('#tr-'+id+' td .product-quantity').data('quantity', this.products[prodIndex].pQuantity);

                $('#tr-'+id+' td .total').text( '£'+ this.calculateSum(data,this.products[prodIndex].pQuantity) );
                $('#tr-'+id+' td .total').data('total', '£'+ this.calculateSum(data,this.products[prodIndex].pQuantity));

                //console.clear();
                //console.log("quantity: ", $('#tr-'+id+' td .product-quantity').data('quantity'));
                //console.log("total: ", $('#tr-'+id+' td .total').data('total'));
            } else {
                this.products.push({pId:id,pQuantity:1});
                let itemInCart = [  '<tr id="tr-'+ id +'">',
                                    '<td class="prod-name-cart">'+data.productName+'</td>',
                                    '<td><span class="product-quantity shop-info" data-quantity="1">1</span></td>',
                                    '<td><span class="price shop-info" data-price="'+data.price+'">'+data.price+'</span></td>',
                                    '<td><span class="total shop-info" data-total="'+data.price+'">'+data.price+'</span></td>',
                                    '<td><button class="remove-item-cart">Remove</button></td>',
                                    '</tr>'
                                ].join("\n");
                $(itemInCart).appendTo('#cart-data');
            }
            this.displayGrandTotal();
        } else {
            // 7.. As a User I am unable to Out of Stock products to the shopping cart.
            alert('Out of Stock! Sorry no more '+data.productName+' is available');
            $('#'+id).attr('disabled',true);
        }

        //console.log("this.products endof addProductToCart : ",this.products);
    }

    removeProductFromCart(id){
        // Remove only if the product is availabe in basket and until reaches 0
        id = id.replace(/tr-/g,"");
        let result = getCartQuantity(this.products,id); //[prodIndex,cartItemQuantity]
        let prodIndex = result[0];
        let cartItemQuantity = result[1];

        if (cartItemQuantity > 0){
            this.products[prodIndex].pQuantity = this.products[prodIndex].pQuantity - 1;
            $('#tr-'+id+' td .product-quantity').text(this.products[prodIndex].pQuantity);
            $('#tr-'+id+' td .product-quantity').data('quantity', this.products[prodIndex].pQuantity);

            $('#tr-'+id+' td .total').text( '£'+ this.calculateSum(ProductsData[id],this.products[prodIndex].pQuantity) );
            $('#tr-'+id+' td .total').data('total', '£'+ this.calculateSum(ProductsData[id],this.products[prodIndex].pQuantity));

            this.displayGrandTotal();
        }
        if (this.products[prodIndex].pQuantity === 0){
            //remove item dislpay from cart
            this.products.splice(prodIndex,1);
            $('#tr-'+id).detach();

            //In this desing - Reset voucher so user encouraged to re-think it
            $('#inputGroupSelect01').prop('selectedIndex',0);
            this.voucher = 0;
        }
        if(this.products.length === 0){
            $('#total-grand').text('£0');
        }

        let data = ProductsData[id]
        let quantity = parseInt(data.quantity,10);
        if (quantity >= cartItemQuantity ){
            $('#'+id).attr('disabled',false);
        }
    }

    calculateSum(data,quantity){
        return parseFloat(data.price.replace(/£/g,"") , 10) * quantity;
    }

    calculateTotal(){
        let total = 0;
        this.products.forEach(prod => {
            let pQ = prod.pQuantity;
            let price = ProductsData[prod.pId].price;
            price = parseFloat(price.replace(/£/g,"") , 10);
            total += (pQ*price);
        });
        
        //console.log("calc total price: ", total);
        return total;
    }

    displayGrandTotal(){
        //-scen 5
        //As a User I can view the total price for the products in my shopping cart with discounts applied.
        let total = this.calculateTotal();
        if (this.voucher > 0){
            total -= this.voucher;
        }
        $('#total-grand').text('£'+ total);
    }

    setVoucher(voucher){
        //4- As a User I can apply a voucher to my shopping cart.
        //6- As a User I am alerted when I apply an invalid voucher to my shopping cart.
        //check if voucher is valid
        // set the value of this.voucher with the correct voucher
        
        //Assumption: User can only apply for one voucher at a time
        let total = this.calculateTotal();
        voucher = parseFloat( voucher, 10 );
        switch(voucher){
            case 5: 
                //console.log("in 5");
                if (this.products.length > 0){
                    this.voucher = voucher;
                } else {
                    alert("Invalid voucher! First add items to your basket.");
                    $('#inputGroupSelect01').prop('selectedIndex',0);
                }
                break;

            case 10: 
                //over £50
                //console.log("in 10");
                if (total > 50){
                    this.voucher = voucher;
                } else {
                    alert("Invalid voucher! You have not spend over £50.");
                    $('#inputGroupSelect01').prop('selectedIndex',0);
                }
                break;

            case 15: 
                //when you have bought at least one footwear item and spent over £75.00  
                //console.log("in 15");
                if (total > 75){
                    let itemCategories = this.products.map( item => ProductsData[item.pId].category );
                    let validItem = itemCategories.find(item => item.match(/footwear/g));
                    if (validItem !== undefined){
                        this.voucher = voucher;
                    } else {
                        alert("Invalid voucher! You do not have any footwear in the shopping cart.");
                        $('#inputGroupSelect01').prop('selectedIndex',0);
                    }
                } else {
                    alert("Invalid voucher! You have not spend over £75.");
                    $('#inputGroupSelect01').prop('selectedIndex',0);
                }
                break;

            default:
                this.voucher = 0;
        }
        //this.displayTotal();
        this.displayGrandTotal();
        //console.log("voucher:", this.voucher);
    }

}

//----------------------------------------------------
function getCartQuantity(products,id){
    let cartItemQuantity = 0;
    let prodIndex = -1;
    if (products.length > 0) {
        prodIndex = products.findIndex( item => item.pId === id );
        if (prodIndex !== -1){
            cartItemQuantity = products[prodIndex].pQuantity;
        }
    }
    return [prodIndex,cartItemQuantity]
}
//----------------------------------------------------

$( document ).ready(function() {
    //console.log("Producst: ", ProductsData);
    let keys = Object.keys(ProductsData);
    //console.log("Keys: ", keys);
    keys.forEach( key => {
        let data = ProductsData[key];
        let catClass = data.category.replace(/ |'/g,"");
        if (!$('.card-deck').hasClass(catClass)){
            let deckStructure = [
                '<div class="card-header bg-info text-light rounded" id="'+data.id+'">'+data.category+'</div>',
                '<div class="card-deck mb-3 text-center '+catClass+'"></div>'
            ].join("\n");

            $(deckStructure).appendTo(".container");
            $('<a class="flex-sm-fill text-sm-center nav-link" href="#'+data.id+'">'+ data.category +'</a>').appendTo(".nav-top");
        }
        let card = [
                        '<div class="card mb-4 shadow-sm product">',
                        '<div class="card-header">',
                            '<h4 class="my-0 font-weight-normal">'+data.productName+'</h4>',
                        '</div>',
                        '<div class="card-body">',
                            '<h2 class="card-title pricing-card-title">'+data.price+'</h2>',
                            '<ul class="list-unstyled mt-3 mb-4">',
                            '<li>'+data.category+'</li>',
                            '<li><span>Quantity in stock: </span>'+data.quantity+'</li>',
                            '</ul>'+addBasketBtns(data.id),
                        '</div>',
                        '</div>'
        ].join("\n");
        $(card).appendTo('.'+catClass);
    });

    $('.close-sh-cart').on("click",function(){
        $('.sh-cart-content-wrap').css('display','none');
    });
    
    $('#show-shopping').on("click",function(){
        $('.sh-cart-content-wrap').toggle();
    });

    //-----------------------
    
    let currentShoppingCart = new ShoppingCart();
    if (currentShoppingCart.products.length === 0){
        let itemInCart = [ '<table class="table table-striped" id="cart-data">',
                            '<thead>',
                            '<tr class="header-blue">',
                            '<th scope="col">Product</th>',
                            '<th scope="col">Quantity</th>',
                            '<th scope="col">Price</th>',
                            '<th scope="col">Total</th>',
                            '<th scope="col"></th>',
                            '</tr>',
                            '</thead></table>',
                            '<table class="table" id="grand-total">',
                            '<tr class="header-blue">',
                            '<th scope="col">Voucher</th>',
                            '<td id="total-voucher">',
                            '<select class="custom-select" id="inputGroupSelect01">',
                            '<option selected>Select a Voucher</option>',
                            '<option value="5">£5 off your order</option>',
                            '<option value="10">£10.00 off when you spend over £50.00</option>',
                            '<option value="15">£15.00 off when you have bought at least one footwear item and spent over £75.00</option>',
                            '</select>',
                            '</td>',
                            '</tr>',
                            '<tr class="header-blue">',
                            '<th scope="col" id="grand-total-caption">Grand total</th>',
                            '<td id="total-grand">£0</td>',
                            '</tr>',
                            '</table>',
                        ].join("\n");
        $(itemInCart).appendTo('.sh-cart-content-wrap');
    }

    $('.add-item-cart').on("click",function(){
        console.clear();
        if ($('.sh-cart-content-wrap').is(':hidden')){
            $('.sh-cart-content-wrap').css('display','block');
        }
        let prodId = $(this).attr('id');
        currentShoppingCart.addProductToCart(prodId);
    });

    $('#cart-data').on("click",".remove-item-cart",function(){
        console.clear();
        let prodId = $(this).parents('tr').attr('id');
        currentShoppingCart.removeProductFromCart(prodId);
    });

    $('#get-total-price').on("click",function(){
        //currentShoppingCart.displayTotal();
        currentShoppingCart.displayGrandTotal();
    });

    $('#inputGroupSelect01').on("change",function(){
        currentShoppingCart.setVoucher($(this).val());
    });
});

//----------------------------------------------------
//disabled="disabled" add this to btn
function addBasketBtns (id){
    let btn = [
              '<div class="input-group">',
              '<input type="button" class="btn btn-lg btn-outline-primary add-item-cart" '+
              'id="'+ id +'" value="Add to basket">',
            ].join("\n");
      return btn;
}
