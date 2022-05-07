// AUTHOR: MEET PATEL

const bodyParser = require('body-parser');
const express = require("express");
const loggedInUser = require("../utils/getLoggedInUser");
var db = require('./dbConnect');

const storeWishlistProduct = (req, res, next) => {
  console.log("Testing the post for storing data");
  let userId;
  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }
    console.log("req.body.product_id: ",req.body);
    if (req && req.body && req.body.product_id) {
      let data = { product_id: req.body.product_id };
      let sql = "INSERT INTO wishlist (`user_id`,`product_id`) VALUES ('" + userId + "','" + req.body.product_id + "')";
      console.log(data);
      let query = db.query(sql, data, (err, results) => {
          console.log(err);
        if (err) throw err;
        console.log("results",results);
        // res.status(200).json({success: true, message: "Added Product to Review successfully"});
        return next();
      });
    }
  } catch (error) {
    console.log("error",error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
}
const controller = { storeWishlistProduct };

module.exports = controller;