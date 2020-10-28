const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "ajt22t6t9gsy",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "QYaZ7FPDkEzjL6xMtJ_qv4sxnBs0H0ZvfXbS0BXiVNE",
});

// import class names
const addedNotification = document.querySelector(".addedNotification");
const cartClose = document.querySelector(".cartClose"); 
const showCart = document.querySelector(".navCartIcon");
const closeSideNav = document.querySelector(".sidebarNavClose");
const showSideNav = document.querySelector(".navShowIcon");
const cartMain = document.querySelector(".cart");
const cartContainer = document.querySelector(".cartContainer");
const sidebarNav = document.querySelector(".sidebarNav");
const productsDOM = document.querySelector(".productsContainer");
const cartsDOM = document.querySelector(".cart-center");
const totalPriceDOM = document.querySelector(".totalPrice");
const cartItemsDOM = document.querySelector(".cartItems");
const clearCart = document.querySelector(".clearCart");
// empty variable declared
let allCart = [];
let allButtons = [];
let allProducts = [];
// for modal yes or no
const removeSingleCart = document.querySelector(".removeSingleCart");
const NoRemoveCart = document.querySelector(".noRemoveCart");
const YesRemoveCart = document.querySelector(".yesRemoveCart");
NoRemoveCart.addEventListener("click", () => {
  removeSingleCart.classList.remove("unsetScale");
});
YesRemoveCart.addEventListener("click", () => {
  removeSingleCart.classList.remove("unsetScale");
});

// MyCart everything functionality here
class MyCart {
  // get products from json file/server
  async gettingProducts() {
    try {
      let contentfull = await client.getEntries({
        content_type: "accessoriesStore",
      });
      // .then((response) => console.log(response.items))
      // .catch(console.error)

      // let get = await fetch("accessories.json");
      // get = await get.json();
      contentfull = contentfull.items;
      contentfull = contentfull.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, image, id };
      });
      return contentfull;
    } catch (error) {
      console.log(error);
    }
  }
  // show all products in webpage
  displayProducts(products) {
    let allProductsHTML = "";
    products.forEach((product) => {
      let createDiscount = product.price;
      createDiscount = createDiscount / 100;
      createDiscount = createDiscount * 85;
      createDiscount = parseFloat(createDiscount.toFixed(1));
      allProductsHTML += `
    <div class="product">
    <div class="product-top">
     <img src=${product.image}>
     <button class="btn btn-secondary btn-sm addCartBtn btnEffect" data-id=${product.id}>
      <i class="fas fa-cart-plus"></i>
      ADD TO CART
     </button>
     <span class="discount">15% OFF</span>
    </div>
    <div class="product-bottom py-2 bg-light">
     <p class="text-danger m-0">
      Price : <b>
       $<del class="price">${product.price}</del>
       $<span class="discountPrice">${createDiscount}</span>
      </b>
     </p>
     <h3 class="m-0 title text-info">${product.title}</h3>
    </div>
   </div>
    `;
      productsDOM.innerHTML = allProductsHTML;
    });
  }
  // get buttons and buttons all action
  cartAction(button, text) {
    button.innerText = text;
    button.disabled = true;
    button.classList.remove("btnEffect");
  }
  getButtons() {
    const buttons = [...document.querySelectorAll(".addCartBtn")];
    allButtons = buttons;
    buttons.forEach((button) => {
      const id = button.dataset.id;
      const inCart = allCart.find((cart) => cart.id == id);
      if (inCart) {
        this.cartAction(button, "already added");
      }
      button.addEventListener("click", (e) => {
        this.cartAction(e.target, "Added");
        cartItemsDOM.classList.add("zoom");
        addedNotification.classList.add("added");
        setTimeout(() => {
          addedNotification.classList.remove("added");
          cartItemsDOM.classList.remove("zoom");
        }, 705); 
        // product from allProducts
        const product = { ...this.getSingleProduct(id), amount: 1 };
        // set all single product in allCarts
        allCart = [...allCart, product];
        // save allCart in locale storage
        this.saveAllCart(allCart);
        // set Product in cart
        this.setCartProduct(product);
        // setCartProductValues
        this.setCartValues(allCart);
      });
    });
  }
  // setCartProductValues
  setCartValues(allCart) {
    let totalPrice = 0;
    let totalAmount = 0;
    allCart.map((cart) => {
      totalPrice += cart.price * cart.amount;
      totalAmount += cart.amount;
    });
    totalPriceDOM.innerText = totalPrice;
    cartItemsDOM.innerText = totalAmount;
  }
  // set Product in cart
  setCartProduct(product) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` 
     <div class="cart-left">
      <img src=${product.image}>
      <div class="cart-left-text">
       <p class="m-0 cart-title">${product.title}</p>
       <p class="m-0 "><span class="cart-price">$${product.price}</span></p> 
       <button class="btn btn-sm btn-danger removeCartItem" data-id=${product.id}>remove</button>
      </div>
     </div>
     <div class="cart-right text-center">
      <p class='increment' data-id=${product.id}> + </p>
      <p class="cartValue m-0"> ${product.amount} </p>
      <p class='decrement' data-id=${product.id}> - </p>
     </div> 
   `;
    cartsDOM.appendChild(div);
  }
  // get single product
  getSingleProduct(id) {
    return allProducts.find((product) => product.id == id);
  }
  // locale storage set & get functionality
  saveAllCart(allCart) {
    localStorage.setItem("allCart", JSON.stringify(allCart));
  }
  // get all cart
  getAllCart() {
    const is = localStorage.getItem("allCart");
    if (is) {
      return JSON.parse(is);
    } else {
      return [];
    }
  }
  // set up others funcitonality
  setupApp() {
    allCart = this.getAllCart();
    this.setCartValues(allCart);
    this.setCartAllSingleProduct(allCart);
  }
  setCartAllSingleProduct(allCart) {
    allCart.forEach((cart) => this.setCartProduct(cart));
    this.cartLogic();
  }
  // cart logic
  cartLogic() {
    clearCart.addEventListener("click", () => {
      this.ClearCart();
    });
    cartsDOM.addEventListener("click", (e) => {
      if (e.target.classList.contains("removeCartItem")) {
        const removeCart = e.target;
        const id = removeCart.dataset.id;
        this.removeItem(id);
        cartsDOM.removeChild(
          removeCart.parentElement.parentElement.parentElement
        );
      } else if (e.target.classList.contains("increment")) {
        let incress = e.target;
        let id = incress.dataset.id;
        let findCart = allCart.find((cart) => cart.id == id);
        findCart.amount = findCart.amount + 1;
        this.setCartValues(allCart);
        this.saveAllCart(allCart);
        incress.nextElementSibling.innerText = findCart.amount;
      } else if (e.target.classList.contains("decrement")) {
        let decress = e.target;
        let id = decress.dataset.id;
        let findCart = allCart.find((cart) => cart.id == id);
        if (findCart.amount > 1) {
          findCart.amount = findCart.amount - 1;
          this.setCartValues(allCart);
          this.saveAllCart(allCart);
          decress.previousElementSibling.innerText = findCart.amount;
        } else {
          removeSingleCart.classList.add("unsetScale");
          this.yesRemoveCart(id, decress);
        }
      }
    });
  }
  // yes remove cart from modal
  yesRemoveCart(id, decress) {
    YesRemoveCart.addEventListener("click", () => {
      this.removeItem(id);
      cartsDOM.removeChild(decress.parentElement.parentElement);
    });
  }
  ClearCart() {
    const cartID = allCart.map((cart) => cart.id);
    cartID.forEach((id) => this.removeItem(id));
    cartsDOM.innerHTML = "";
    cartHide();
  }
  removeItem(id) {
    allCart = allCart.filter((cart) => cart.id != id);
    this.setCartValues(allCart);
    localStorage.removeItem("allCart");
    const button = this.getSingleButton(id);
    button.innerText = "ADD TO CART";
    button.disabled = false;
    button.classList.add("btnEffect");
    if (cartsDOM.childElementCount == 1) {
      cartHide();
    }
  }
  getSingleButton(id) {
    return allButtons.find((button) => button.dataset.id == id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const myCart = new MyCart();
  myCart
    .gettingProducts()
    .then((data) => {
      allProducts = data;
      myCart.displayProducts(data);
    })
    .then(() => {
      myCart.getButtons();
    });
  myCart.setupApp();
});

// this function for toggle sideNavbar and Cart Items
function cartShow() {
  cartMain.classList.add("cartShow");
  cartContainer.classList.add("cartShow");
}
function cartHide() {
  cartMain.classList.remove("cartShow");
  cartContainer.classList.remove("cartShow");
}
showCart.addEventListener("mouseover", cartShow);
cartClose.addEventListener("mouseover", cartHide);

showSideNav.addEventListener("click", () => {
  sidebarNav.classList.add("cartShow");
});
closeSideNav.addEventListener("click", () => {
  sidebarNav.classList.remove("cartShow");
});
