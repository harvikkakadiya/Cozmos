// Author: Fenil Shah

const loggedInUser = require("../utils/getLoggedInUser");
const constants = require("../../constants/constants");
const db = require("./dbConnect");

// This method will check whether a product is already present in the User's Cart or not.
const isProductPresentInCart = (req, res, next) => {
  console.log("Checking whether the product is already present in Cart or not");
  let userId;

  try {
    if (req.body.product_id && req.body.quantity) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });

      console.log(`The User ID is ${userId}`);

      db.query(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?;",
        [userId, req.body.product_id],
        (err, result) => {
          if (err) {
            console.log("Error in Query");
            return res.status(500).json({
              success: false,
              message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
            });
          } else if (result.length > 0) {
            console.log("This product is already added to Cart");
            return res.status(400).json({
              success: false,
              message: "Product is already added to Cart",
            });
          } else {
            console.log("Adding this product in the Cart");
            //The next() will call the addToCart method if the product is not present in the Cart.
            return next();
          }
        }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: constants.BAD_REQUEST_MESSAGE });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

// This method adds the product into cart of a particular user.
const addToCart = (req, res, next) => {
  console.log("Inside addToCart method");
  let userId;

  try {
    if (req.body.product_id && req.body.quantity) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });

      console.log(`The User ID is ${userId}`);

      let data = {
        user_id: userId,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
      };

      db.query("INSERT INTO cart SET ?;", data, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
          });
        } else if (result.affectedRows == 1) {
          console.log("Added to Cart Successfully");
          //The next() will call the fetchCartItems method present inside the getCartItems.js
          return next();
        } else {
          return res.status(400).json({
            success: false,
            message: "Error in Adding product to the cart",
          });
        }
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: constants.BAD_REQUEST_MESSAGE });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

// This method removes the product from cart of a particular user.
const removeFromCart = (req, res, next) => {
  console.log("Inside removeFromCart method");
  let userId;

  try {
    if (req.body.product_id) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });

      console.log(`The User ID is ${userId}`);

      const user_id = userId;
      const product_id = req.body.product_id;

      db.query(
        "DELETE FROM cart WHERE user_id = ? AND product_id = ?;",
        [user_id, product_id],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
            });
          } else if (result.affectedRows == 1) {
            console.log("Removed from Cart Successfully");
            //The next() will call the fetchCartItems method present inside the getCartItems.js
            return next();
          } else {
            return res.status(400).json({
              success: false,
              message: "Error in Removing product from the cart",
            });
          }
        }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: constants.BAD_REQUEST_MESSAGE });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

// This method removes all the products present in the User's Cart.
const emptyCart = (req, res, next) => {
  console.log("Inside emptyCart method");
  let userId;

  try {
    loggedInUser.getUser(req.headers.authorization, function (err, id) {
      userId = id;
    });

    console.log(`The User ID is ${userId}`);

    const user_id = userId;

    db.query("DELETE FROM cart WHERE user_id = ?;", user_id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
        });
      } else if (result.affectedRows > 0) {
        console.log("Cart Emptied Successfully");
        //The next() will call the fetchCartItems method present inside the getCartItems.js
        return next();
      } else {
        return res.status(400).json({
          success: false,
          message: "Cart is already empty",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

// This method updates the quantity of a particular product in the User's Cart.
const updateCart = (req, res, next) => {
  console.log("Inside updateCart method");
  let userId;

  try {
    if (req.body.product_id && req.body.quantity) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });

      console.log(`The User ID is ${userId}`);

      const user_id = userId;
      const product_id = req.body.product_id;
      const quantity = req.body.quantity;

      db.query(
        "UPDATE cart set quantity = ? WHERE user_id = ? AND product_id = ?;",
        [quantity, user_id, product_id],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
            });
          } else if (result.changedRows == 1) {
            console.log("Cart Updated Successfully");
            //The next() will call the fetchCartItems method present inside the getCartItems.js
            return next();
          } else {
            return res.status(400).json({
              success: false,
              message: "Error in Updating the product quantity in the cart",
            });
          }
        }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: constants.BAD_REQUEST_MESSAGE });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

const controller = {
  isProductPresentInCart,
  addToCart,
  removeFromCart,
  emptyCart,
  updateCart,
};

module.exports = controller;
