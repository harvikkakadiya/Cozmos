//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

//This API generates the order details of the placed order in the Order table. It assigns the order_id, order_total_amount,
//address_id(address id of one with the shipping Indicator Y), cancel_status and completed status.
//Order details are used by the Order management page to show details of the order
const generateOrder = (req, res) => {

  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }
    console.log("User ID: ", userId);
    if (!userId) {
      return res.status(404).json({ message: "Cannot get user", success: false });
    }

    let sql =
      "insert into cozmos.order(user_id, order_total_amount, address_id, cancel_status, completed_status) select distinct b.user_id,selling_price, a.id, 0 as cancel_status, 0 as completed_status from (" +
      " select distinct p.name, p.selling_price, c.quantity, c.user_id from products p, cart c where p.id = c.product_id and c.user_id = " +
      userId +
      " union select 'Total' as name, sum(p.selling_price*c.quantity) as selling_price, null as quantity, c.user_id from products p, cart c where c.user_id = " +
      userId +
      " and c.product_id = p.id) b," +
      " address a " +
      " where b.name = 'Total' and b.user_id = a.user_id and a.shipping_ind = 'Y' ";

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      console.log(results);
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true, message: results.insertId }));
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { generateOrder };

module.exports = controller;
