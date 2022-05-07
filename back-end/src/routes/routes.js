const express = require("express");
const controller = require("../controllers/controller.js");
const deliveryAddressController = require("../controllers/deliveryAddress.js");
const savedAddressController = require("../controllers/savedAddress.js");
const shippingAddress = require("../controllers/shippingAddress");
const resetShippingAddress = require("../controllers/resetShipping");
const getCartItems = require("../controllers/getCartItems");
const orderGeneration = require("../controllers/generateOrder");
const orderItemsGeneration = require("../controllers/generateOrderItems");
const billingInfoGeneration = require("../controllers/generateBillingInfo");
const login = require("../controllers/login.js");
const register = require("../controllers/register");
const authenticator = require("../middleware/authentication");
const wishlistedProductController = require("../controllers/wishlistProducts.js");
const addWishlistedProductController = require("../controllers/addWishlistProduct.js");
const deleteWishlistController = require("../controllers/wishlistProducts.js");
const addToCartWishlistController = require("../controllers/wishlistProducts.js");
const orderController = require("../controllers/orderController");
const productCatalogue = require("../controllers/productCatalogue");
const productInformation = require("../controllers/productInformation");
const cart = require("../controllers/cart");
const review = require("../controllers/review.js");

const trendingProducts = require("../controllers/trendingProducts");
const trendingBrands = require("../controllers/trendingBrands");

const router = express.Router();

router.post("/storedeliveryaddress", deliveryAddressController.storedeliveryAddress);
router.get("/getaddress", authenticator.authentication, savedAddressController.fetchSavedAddress);
router.post("/shippingaddress", shippingAddress.setShippingAddress);
router.post("/resetshippingaddress", resetShippingAddress.resetShippingAddress);
router.get("/getcartitems", authenticator.authentication, getCartItems.fetchCartItems);
router.post("/generateorder", orderGeneration.generateOrder);
router.post("/generateorderitems", orderItemsGeneration.generateOrderItems);
router.post("/generatebillinginfo", billingInfoGeneration.generateBillingInfo);

router.post("/login", login.login);
router.post("/register", register.registerUser);
router.get("/login", authenticator.authentication, login.checkLogin);
router.get("/getwishlistedproducts", authenticator.authentication, wishlistedProductController.showWishlistedProduct);
router.post("/wishlistproduct", authenticator.authentication, addWishlistedProductController.storeWishlistProduct, wishlistedProductController.showWishlistedProduct);
router.post("/deleteWishlistProduct", authenticator.authentication, deleteWishlistController.deleteWishlist, wishlistedProductController.showWishlistedProduct);
router.post("/cartwishlistProduct", authenticator.authentication, addToCartWishlistController.addTocartWishlistRemove);

router.get("/get-user-details", authenticator.authentication, login.getUserDetails);
router.post("/update-user-details", authenticator.authentication, login.updateUserDetails);
router.post("/change-user-password", authenticator.authentication, login.changePassword);
router.post("/set-password", login.setPassword);
router.post("/get-email-for-forgot-password", login.getEmailForForgotPassword);
router.get("/logout", authenticator.authentication, login.logout);

router.post("/cart/update", authenticator.authentication, cart.updateCart, getCartItems.fetchCartItems);

router.get("/getorders", authenticator.authentication, orderController.getOrders);

router.post("/cart/add", authenticator.authentication, cart.isProductPresentInCart, cart.addToCart, getCartItems.fetchCartItems);
router.delete("/cart/remove", authenticator.authentication, cart.removeFromCart, getCartItems.fetchCartItems);
router.delete("/cart/empty", authenticator.authentication, cart.emptyCart, getCartItems.fetchCartItems);

router.post("/updateOrderStatus", authenticator.authentication, orderController.updateOrderStatus);
router.get("/getOrderDetails", authenticator.authentication, orderController.getOrderDetails);
router.get("/productcatalogue", productCatalogue.productCatalogue);
router.get("/productinformation/:id", productInformation.productInformation);
router.post("/addReview", review.addReview);
router.get("/review/:product_id", review.getreview);

router.get("/trendingproducts", trendingProducts.fetchTrendingProducts);
router.get("/trendingbrands", trendingBrands.fetchTrendingBrands);

module.exports = router;
