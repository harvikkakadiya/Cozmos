//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

//After the user makes the successful payment from the Payment page. This API generates the entry in the order_items table which
//is used by the Order management page to show details of the order.
//For the placed order and Order Id fetched from the API generateOrder.js, this API generates the item details under that order.
const generateOrderItems = (req, res) => {
  const orderId = req.body.orderId;
  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }
    console.log("User ID: ", userId);
    console.log("Order Id: " + orderId);
    if (!userId) {
      return res
        .status(404)
        .json({ message: "Cannot get user", success: false });
    }

    let sql =
      "insert into order_items select distinct o.id as order_id, p.id as product_id, c.quantity  from cozmos.cart c, cozmos.products p, cozmos.order o where p.id = c.product_id and  o.user_id = c.user_id and c.user_id = " +
      userId +
      " and o.id = " +
      orderId;

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(
        JSON.stringify({
          status: 200,
          error: null,
          response: results,
          success: true,
        })
      );
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const controller = { generateOrderItems };

module.exports = controller;
